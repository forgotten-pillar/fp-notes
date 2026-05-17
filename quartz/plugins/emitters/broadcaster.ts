import { QuartzEmitterPlugin } from "../types";
import { FullSlug, SimpleSlug } from "../../util/path"
import { getDate } from "../../components/Date"
import { escapeHTML } from "../../util/escape"
import { toHtml } from "hast-util-to-html"
import { Root } from "hast"

// Skip notes whose date is older than this many days at broadcast collection time.
// The backend (v1.1) also dedups by slug, but this filter prevents old notes from
// being re-sent if the backend's broadcasted-notes table is wiped, and reduces
// noisy payload size on every build.
// Trade-off: to force re-broadcast of a >7-day-old note, bump its date or temporarily
// lift this constant — there is no per-note override.
const MAX_BROADCAST_AGE_DAYS = 7

export function pickBroadcastDescription(
  frontmatter: Record<string, unknown> | undefined,
  fallbackDescription: string | undefined,
): string {
  const social = frontmatter?.["fp-social-media"]
  if (typeof social === "string" && social.trim() !== "") return social.trim()

  const desc = frontmatter?.["description"]
  if (typeof desc === "string" && desc.trim() !== "") return desc.trim()

  if (typeof fallbackDescription === "string" && fallbackDescription.trim() !== "") {
    return fallbackDescription.trim()
  }

  return ""
}

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

export const Broadcaster: QuartzEmitterPlugin = () => ({
    name: 'Broadcaster',
    getQuartzComponents: () => [],
    async emit(ctx, content, _resources) {
        const newBroadcastList: Broadcast = new Map()
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

            const ageMs = Date.now() - date.getTime()
            const maxAgeMs = MAX_BROADCAST_AGE_DAYS * 24 * 60 * 60 * 1000
            if (ageMs > maxAgeMs) {
                continue
            }

            const description = pickBroadcastDescription(file.data.frontmatter, file.data.description)

            newBroadcastList.set(slug, {
                title: file.data.frontmatter?.title!,
                links: file.data.links ?? [],
                tags: file.data.frontmatter?.tags ?? [],
                content: file.data.text ?? "",
                richContent: escapeHTML(toHtml(tree as Root, { allowDangerousHtml: true })),
                date: date,
                description,
            })

            notesPayload.push({
                slug,
                title: file.data.frontmatter?.title ?? "",
                description,
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
            console.error("Broadcaster: fetch failed:", err)
            return []
        }

        if (!response.ok) {
            let errBody = ""
            try { errBody = await response.text() } catch {}
            console.error(`Broadcaster: POST failed with status ${response.status}:`, errBody)
            return []
        }

        let respBody: unknown = null
        try { respBody = await response.json() } catch {}
        console.log(formatBroadcastResponse(respBody))

        return []
    }
})

export function formatBroadcastResponse(respBody: unknown): string {
    if (respBody === null || typeof respBody !== "object") {
        return "Broadcaster: POST succeeded (response not parseable)"
    }

    const body = respBody as Record<string, unknown>
    const sent = Array.isArray(body.sent) ? (body.sent as unknown[]) : null
    const skipped = Array.isArray(body.skipped) ? (body.skipped as unknown[]) : null

    const sentCount = typeof body.sentCount === "number" ? body.sentCount : null
    const failedCount = typeof body.failedCount === "number" ? body.failedCount : null
    const removed = typeof body.removedSubscriptions === "number" ? body.removedSubscriptions : null

    if (sent !== null || skipped !== null) {
        const lines: string[] = ["Broadcaster: POST succeeded"]
        if (sent && sent.length > 0) {
            lines.push(`  Sent (${sent.length}): ${sent.join(", ")}`)
        }
        if (skipped && skipped.length > 0) {
            lines.push(`  Skipped — already broadcast (${skipped.length}): ${skipped.join(", ")}`)
        }
        if (sentCount !== null || failedCount !== null || removed !== null) {
            lines.push(`  Subscribers reached: ${sentCount ?? 0}, failed: ${failedCount ?? 0}, removed: ${removed ?? 0}`)
        }
        return lines.join("\n")
    }

    return `Broadcaster: POST succeeded — sent: ${sentCount ?? 0}, failed: ${failedCount ?? 0}, removed: ${removed ?? 0}`
}