import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import path from "path"
import { glob } from "../../util/glob"
import DepGraph from "../../depgraph"

// Files under quartz/static/ that must also be emitted to the site root so the
// browser can find them at the canonical PWA paths (e.g. /sw.js needs to live
// at root for service-worker scope "/" to apply).
const ROOT_LEVEL_STATIC_FILES = ["manifest.webmanifest", "sw.js"]

export const Static: QuartzEmitterPlugin = () => ({
  name: "Static",
  getQuartzComponents() {
    return []
  },
  async getDependencyGraph({ argv, cfg }, _content, _resources) {
    const graph = new DepGraph<FilePath>()

    const staticPath = joinSegments(QUARTZ, "static")
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    for (const fp of fps) {
      graph.addEdge(
        joinSegments("static", fp) as FilePath,
        joinSegments(argv.output, "static", fp) as FilePath,
      )
      if (ROOT_LEVEL_STATIC_FILES.includes(fp)) {
        graph.addEdge(
          joinSegments("static", fp) as FilePath,
          joinSegments(argv.output, fp) as FilePath,
        )
      }
    }

    return graph
  },
  async emit({ argv, cfg }, _content, _resources): Promise<FilePath[]> {
    const staticPath = joinSegments(QUARTZ, "static")
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    await fs.promises.cp(staticPath, joinSegments(argv.output, "static"), {
      recursive: true,
      dereference: true,
    })
    const emitted = fps.map((fp) => joinSegments(argv.output, "static", fp)) as FilePath[]

    for (const fp of ROOT_LEVEL_STATIC_FILES) {
      const src = path.join(staticPath, fp)
      if (fs.existsSync(src)) {
        const dest = joinSegments(argv.output, fp)
        await fs.promises.copyFile(src, dest)
        emitted.push(dest as FilePath)
      }
    }

    return emitted
  },
})
