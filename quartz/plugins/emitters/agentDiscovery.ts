import fs from "fs"
import path from "path"
import crypto from "crypto"
import chalk from "chalk"
import { FilePath, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import DepGraph from "../../depgraph"

const ROBOTS_TXT = `# Forgotten Pillar Notes - robots.txt
# Policy: open access for all crawlers including AI training and search.

User-agent: *
Allow: /
Disallow: /private/
Disallow: /templates/
Sitemap: https://notes.forgottenpillar.com/sitemap.xml

# Content Signals (https://contentsignals.org/) - declared AI usage preferences
Content-Signal: ai-train=yes, search=yes, ai-input=yes

# AI training crawlers
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

# AI search / grounding crawlers
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: meta-externalagent
Allow: /
`

const API_CATALOG = {
  linkset: [
    {
      anchor: "https://notes.forgottenpillar.com/",
      "service-doc": [{ href: "https://notes.forgottenpillar.com/", type: "text/html" }],
      "service-meta": [
        { href: "https://notes.forgottenpillar.com/sitemap.xml", type: "application/xml" },
        { href: "https://notes.forgottenpillar.com/index.xml", type: "application/rss+xml" },
      ],
      "https://agentskills.io/rel/index": [
        {
          href: "https://notes.forgottenpillar.com/.well-known/agent-skills/index.json",
          type: "application/json",
        },
      ],
    },
  ],
}

type SkillDef = {
  publicPath: string
  name: string
  type: string
  description: string
  url: string
}

const SKILL_DEFS: SkillDef[] = [
  {
    publicPath: "sitemap.xml",
    name: "Site map",
    type: "data",
    description:
      "Complete enumeration of every published page on The Forgotten Pillar Notes. Each URL can be fetched as HTML or, with Accept: text/markdown, as the markdown source.",
    url: "https://notes.forgottenpillar.com/sitemap.xml",
  },
  {
    publicPath: "index.xml",
    name: "Recent notes feed",
    type: "data",
    description: "RSS 2.0 feed of recently published and updated notes.",
    url: "https://notes.forgottenpillar.com/index.xml",
  },
]

async function writeFile(filePath: string, content: string | Buffer): Promise<void> {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
  await fs.promises.writeFile(filePath, content)
}

export const AgentDiscovery: QuartzEmitterPlugin = () => ({
  name: "AgentDiscovery",
  getQuartzComponents() {
    return []
  },
  async getDependencyGraph(_ctx, _content, _resources) {
    return new DepGraph<FilePath>()
  },
  async emit({ argv }, _content, _resources): Promise<FilePath[]> {
    const emitted: FilePath[] = []

    const robotsPath = joinSegments(argv.output, "robots.txt") as FilePath
    await writeFile(robotsPath, ROBOTS_TXT)
    emitted.push(robotsPath)

    const apiCatalogPath = joinSegments(argv.output, ".well-known", "api-catalog") as FilePath
    await writeFile(apiCatalogPath, JSON.stringify(API_CATALOG, null, 2))
    emitted.push(apiCatalogPath)

    const skills: Array<Record<string, string>> = []
    for (const def of SKILL_DEFS) {
      const onDisk = joinSegments(argv.output, def.publicPath)
      try {
        const buf = await fs.promises.readFile(onDisk)
        const sha256 = crypto.createHash("sha256").update(buf).digest("hex")
        skills.push({
          name: def.name,
          type: def.type,
          description: def.description,
          url: def.url,
          sha256,
        })
      } catch (err) {
        console.warn(
          chalk.yellow(
            `AgentDiscovery: skipping skill "${def.name}" — could not read ${onDisk}: ${(err as Error).message}`,
          ),
        )
      }
    }

    const skillsIndex = {
      $schema: "https://agentskills.io/schemas/index/v0.2.0.json",
      skills,
    }
    const skillsPath = joinSegments(
      argv.output,
      ".well-known",
      "agent-skills",
      "index.json",
    ) as FilePath
    await writeFile(skillsPath, JSON.stringify(skillsIndex, null, 2))
    emitted.push(skillsPath)

    return emitted
  },
})
