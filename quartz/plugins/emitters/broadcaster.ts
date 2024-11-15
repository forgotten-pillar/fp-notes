import { QuartzEmitterPlugin } from "../types";
import { FullSlug, SimpleSlug, joinSegments } from "../../util/path"
import { getDate } from "../../components/Date"
import { escapeHTML } from "../../util/escape"
import { toHtml } from "hast-util-to-html"
import { Root } from "hast"
import { Value } from "vfile";
import fs from 'fs'

export type Broadcast = Map<FullSlug, ContentDetails>
export type ContentDetails = {
  title: string
  links: SimpleSlug[]
  tags: string[]
  content: string
  richContent?: string
  date?: Date
  description?: string
}

export const Broadcaster: QuartzEmitterPlugin = () => ({
    name: 'Broadcaster',
    getQuartzComponents: () => [],
    async emit(ctx, content, _resources) {
        const newBroadcastList: Broadcast = new Map()

        for (const [tree, file] of content) {
            const slug = file.data.slug!
            const frontmatter = file.data.frontmatter

            if (!frontmatter || 
                !frontmatter['broadcast'] || 
                (frontmatter['broadcast'] !== 'true' && frontmatter['broadcast'] !== true)
            )
            continue;

            const date = getDate(ctx.cfg.configuration, file.data) ?? new Date()

            newBroadcastList.set(slug, {
                title: file.data.frontmatter?.title!,
                links: file.data.links ?? [],
                tags: file.data.frontmatter?.tags ?? [],
                content: file.data.text ?? "",
                richContent: escapeHTML(toHtml(tree as Root, { allowDangerousHtml: true })),
                date: date,
                description: file.data.description ?? "",
            })
            
            await udpateMarkdownFrontMatter({
                fullPath: joinSegments(file.cwd, file.data.filePath!),
                content: file.value,
                key: 'broadcast',
                value: new Date().toISOString()
            })
        }

        if(newBroadcastList.size > 0) {
          // call API function
        }
        return []
    }
})

function updateFrontmatter(content: string, key: string, newValue: string) {
    // Find the start and end of the frontmatter block
    const frontmatterStart = content.indexOf('---');
    const frontmatterEnd = content.indexOf('---', frontmatterStart + 3);
  
    if (frontmatterStart === -1 || frontmatterEnd === -1) {
      // No frontmatter found, return the original content
      return content;
    }
  
    // Extract the frontmatter
    const frontmatter = content.slice(frontmatterStart + 4, frontmatterEnd);
  
    // Update the specific frontmatter key
    const lines = frontmatter.split('\n');
    const updatedLines = lines.map(line => {
      if (line.startsWith(`${key}:`)) {
        return `${key}: ${newValue}`;
      }
      return line;
    });
  
    // Construct the updated content
    const updatedFrontmatter = updatedLines.join('\n');
    const updatedContent = content.slice(0, frontmatterStart) +
                           '---\n' + updatedFrontmatter + '---\n' +
                           content.slice(frontmatterEnd + 4);
  
    return updatedContent;
  }

  const udpateMarkdownFrontMatter = async (
    {content, fullPath, key, value} : 
    {content: Value, fullPath: string, key: string, value: string}
) => {
    const newValue = updateFrontmatter(content.toString(), key, value);
    await fs.promises.writeFile(fullPath, newValue)
  }