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

type BroadcastNotePayload = {
    slug: string
    title: string
    description: string
    url: string
    publishedAt: string
}

type PendingRewrite = {
    fullPath: string
    content: Value
}

export const Broadcaster: QuartzEmitterPlugin = () => ({
    name: 'Broadcaster',
    getQuartzComponents: () => [],
    async emit(ctx, content, _resources) {
        const newBroadcastList: Broadcast = new Map()
        const pendingRewrites = new Map<FullSlug, PendingRewrite>()
        const notesPayload: BroadcastNotePayload[] = []

        const cfg = ctx.cfg.configuration
        const baseUrl = cfg.baseUrl ?? "notes.forgottenpillar.com"

        for (const [tree, file] of content) {
            const slug = file.data.slug!
            const frontmatter = file.data.frontmatter

            if (!frontmatter ||
                !frontmatter['broadcast'] ||
                (frontmatter['broadcast'] !== 'true' && frontmatter['broadcast'] !== true)
            )
            continue;

            const date = getDate(cfg, file.data) ?? new Date()

            newBroadcastList.set(slug, {
                title: file.data.frontmatter?.title!,
                links: file.data.links ?? [],
                tags: file.data.frontmatter?.tags ?? [],
                content: file.data.text ?? "",
                richContent: escapeHTML(toHtml(tree as Root, { allowDangerousHtml: true })),
                date: date,
                description: file.data.description ?? "",
            })

            pendingRewrites.set(slug, {
                fullPath: joinSegments(file.cwd, file.data.filePath!),
                content: file.value,
            })

            notesPayload.push({
                slug,
                title: file.data.frontmatter?.title ?? "",
                description: file.data.description ?? "",
                url: `https://${baseUrl.replace(/\/+$/, "")}/${slug}`,
                publishedAt: date.toISOString(),
            })
        }

        if (newBroadcastList.size === 0) {
            return []
        }

        const body = { notes: notesPayload }

        if (process.env.BROADCAST_DRY_RUN === 'true') {
            console.log("Broadcaster: BROADCAST_DRY_RUN=true, would POST:", JSON.stringify(body, null, 2))
            return []
        }

        const broadcastUrl = cfg.pushNotifications?.broadcastUrl
        if (!broadcastUrl) {
            console.warn("Broadcaster: no broadcastUrl configured, skipping")
            return []
        }

        const secret = process.env.PUSH_BROADCAST_SECRET
        if (!secret) {
            console.warn("Broadcaster: PUSH_BROADCAST_SECRET not set, skipping push")
            return []
        }

        let response: Response
        try {
            response = await fetch(broadcastUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${secret}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
        } catch (err) {
            console.error("Broadcaster: fetch failed, frontmatter not rewritten:", err)
            return []
        }

        if (!response.ok) {
            let errBody = ""
            try { errBody = await response.text() } catch {}
            console.error(`Broadcaster: POST failed with status ${response.status}, frontmatter not rewritten:`, errBody)
            return []
        }

        let respBody: unknown = null
        try { respBody = await response.json() } catch {}
        console.log("Broadcaster: POST succeeded:", respBody)

        for (const pending of pendingRewrites.values()) {
            await updateMarkdownFrontMatter({
                fullPath: pending.fullPath,
                content: pending.content,
                key: 'broadcast',
                value: new Date().toISOString(),
            })
        }

        return []
    }
})

export function updateFrontmatter(content: string, key: string, newValue: string) {
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

  const updateMarkdownFrontMatter = async (
    {content, fullPath, key, value} :
    {content: Value, fullPath: string, key: string, value: string}
) => {
    const newValue = updateFrontmatter(content.toString(), key, value);
    await fs.promises.writeFile(fullPath, newValue)
  }