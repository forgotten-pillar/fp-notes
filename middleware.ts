// Vercel Routing Middleware: Accept-based content negotiation for Markdown.
//
// `vercel.json` rewrites are evaluated AFTER the filesystem, so with
// `cleanUrls: true` a request to `/contribution` is served as
// `contribution.html` directly and an accept-based rewrite never runs.
// Routing middleware executes BEFORE the filesystem and BEFORE the cache,
// allowing us to proxy `Accept: text/markdown` requests to the `.md` file
// emitted by Quartz's MarkdownPage emitter.

export const config = {
  // Skip paths containing a literal "." so static assets (.png, .xml, .md,
  // etc.) are served directly. Excluding `.md` paths here also prevents the
  // internal proxy fetch below from re-entering middleware.
  matcher: "/((?!.*\\..*).*)",
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") return

  const accept = request.headers.get("accept") ?? ""
  if (!accept.toLowerCase().includes("text/markdown")) return

  const url = new URL(request.url)
  // "/" or "" → "/index.md"; otherwise strip a trailing "/" and append ".md".
  const cleanPath = url.pathname.replace(/\/$/, "")
  const mdPath = cleanPath === "" ? "/index.md" : `${cleanPath}.md`
  const mdUrl = new URL(mdPath + url.search, url.origin)

  let upstream: Response
  try {
    // Use `accept: */*` on the internal fetch so this middleware does not
    // re-trigger and loop. The matcher already excludes `.md` paths, but
    // this is belt-and-suspenders in case the matcher is ever loosened.
    upstream = await fetch(mdUrl, { headers: { accept: "*/*" } })
  } catch {
    return
  }

  if (!upstream.ok) return

  const body = await upstream.text()

  // ~4 chars per token is the rough heuristic matching Cloudflare's
  // documented `x-markdown-tokens` semantics; good enough for client-side
  // context budgeting without pulling in a real tokenizer.
  const tokens = Math.ceil(body.length / 4)

  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // `vary: Accept` is critical: without it a CDN can poison the cache
      // and serve markdown to HTML clients (or vice-versa).
      vary: "Accept",
      "x-markdown-tokens": String(tokens),
      "content-signal": "ai-train=yes, search=yes, ai-input=yes",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  })
}
