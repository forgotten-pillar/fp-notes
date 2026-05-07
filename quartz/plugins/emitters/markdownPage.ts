import { remark } from "remark"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import fs from "fs"
import { QuartzEmitterPlugin } from "../types"
import { FilePath, joinSegments } from "../../util/path"
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
      }

      return fps
    },
  }
}
