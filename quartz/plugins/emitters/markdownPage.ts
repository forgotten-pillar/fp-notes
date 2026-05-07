import { remark } from "remark"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import fs from "fs"
import path from "path"
import { QuartzEmitterPlugin } from "../types"
import { FilePath, FullSlug, joinSegments } from "../../util/path"
import { write } from "./helpers"
import DepGraph from "../../depgraph"

const SKILLS_INDEX_URL =
  "https://notes.forgottenpillar.com/.well-known/agent-skills/index.json"

export const MarkdownPage: QuartzEmitterPlugin = () => {
  const processor = remark().use(remarkFrontmatter, ["yaml", "toml"]).use(remarkGfm)

  return {
    name: "MarkdownPage",
    getQuartzComponents() {
      return []
    },
    async getDependencyGraph(ctx, content, _resources) {
      const graph = new DepGraph<FilePath>()
      for (const [, file] of content) {
        const sourcePath = file.data.filePath!
        const slug = file.data.slug!
        graph.addEdge(sourcePath, joinSegments(ctx.argv.output, slug + ".md") as FilePath)

        for (const aliasSlug of getAliasSlugs(ctx.argv.directory, file)) {
          graph.addEdge(sourcePath, joinSegments(ctx.argv.output, aliasSlug + ".md") as FilePath)
        }
      }
      return graph
    },
    async emit(ctx, content, _resources): Promise<FilePath[]> {
      const cfg = ctx.cfg.configuration
      const fps: FilePath[] = []
      const baseUrl = cfg.baseUrl
        ? `https://${cfg.baseUrl.replace(/\/+$/, "")}`
        : "https://notes.forgottenpillar.com"

      for (const [, file] of content) {
        const slug = file.data.slug
        const filePath = file.data.filePath
        if (!slug || !filePath) continue

        let source: string | null = null
        const value = file.value
        if (typeof value === "string" && value.length > 0) {
          source = value
        } else {
          try {
            source = await fs.promises.readFile(filePath, "utf8")
          } catch {
            source = null
          }
        }
        if (source === null) continue

        let md: string
        try {
          const tree = processor.parse(source)
          md = String(processor.stringify(tree)).replace(/^\n+/, "")
        } catch {
          md = source
        }

        const canonical = `${baseUrl}/${slug}`
        const comment = `<!-- Markdown copy of ${canonical}. Index: ${SKILLS_INDEX_URL} -->\n`
        const out = comment + md

        const fp = await write({
          ctx,
          content: out,
          slug,
          ext: ".md",
        })
        fps.push(fp)

        for (const aliasSlug of getAliasSlugs(ctx.argv.directory, file)) {
          const aliasFp = await write({
            ctx,
            content: out,
            slug: aliasSlug,
            ext: ".md",
          })
          fps.push(aliasFp)
        }
      }

      return fps
    },
  }
}

function getAliasSlugs(directory: string, file: { data: { filePath?: string; frontmatter?: any } }): FullSlug[] {
  const filePath = file.data.filePath
  if (!filePath) return []
  const dir = path.posix.relative(directory, path.dirname(filePath))
  const aliases: string[] = file.data.frontmatter?.aliases ?? []
  const slugs: FullSlug[] = aliases.map((alias) => path.posix.join(dir, alias) as FullSlug)
  const permalink = file.data.frontmatter?.permalink
  if (typeof permalink === "string") {
    slugs.push(permalink as FullSlug)
  }
  return slugs.map((slug) =>
    slug.endsWith("/") ? (joinSegments(slug, "index") as FullSlug) : slug,
  )
}
