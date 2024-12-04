import micromorph from "micromorph"
import { FullSlug, RelativeURL, getFullSlug, normalizeRelativeURLs } from "../../util/path"

// adapted from `micromorph`
// https://github.com/natemoo-re/micromorph
const NODE_TYPE_ELEMENT = 1
let announcer = document.createElement("route-announcer")
const isElement = (target: EventTarget | null): target is Element =>
  (target as Node)?.nodeType === NODE_TYPE_ELEMENT
const isLocalUrl = (href: string) => {
  try {
    const url = new URL(href)
    if (window.location.origin === url.origin) {
      return true
    }
  } catch (e) {}
  return false
}

const isSamePage = (url: URL): boolean => {
  const sameOrigin = url.origin === window.location.origin
  const samePath = url.pathname === window.location.pathname
  return sameOrigin && samePath
}

const getOpts = ({ target }: Event): { url: URL; scroll?: boolean } | undefined => {
  if (!isElement(target)) return
  if (target.attributes.getNamedItem("target")?.value === "_blank") return
  const a = target.closest("a")
  if (!a) return
  if ("routerIgnore" in a.dataset) return
  const { href } = a
  if (!isLocalUrl(href)) return
  return { url: new URL(href), scroll: "routerNoscroll" in a.dataset ? false : undefined }
}

function notifyNav(url: FullSlug) {
  const event: CustomEventMap["nav"] = new CustomEvent("nav", { detail: { url } })
  document.dispatchEvent(event)
}

const cleanupFns: Set<(...args: any[]) => void> = new Set()
window.addCleanup = (fn) => cleanupFns.add(fn)

let p: DOMParser
async function navigate(url: URL, isBack: boolean = false) {
  p = p || new DOMParser()
  
  // More robust View Transition method checking
  const startViewTransition = document.startViewTransition 
    ? document.startViewTransition.bind(document) 
    : null

  const contents = await fetch(`${url}`)
    .then((res) => {
      const contentType = res.headers.get("content-type")
      if (contentType?.startsWith("text/html")) {
        return res.text()
      } else {
        window.location.assign(url)
      }
    })
    .catch(() => {
      window.location.assign(url)
    })

  if (!contents) return

  // Wrap navigation in View Transition if supported
  const performNavigation = async () => {
    // cleanup old
    cleanupFns.forEach((fn) => fn())
    cleanupFns.clear()

    const html = p.parseFromString(contents, "text/html")
    normalizeRelativeURLs(html, url)

    let title = html.querySelector("title")?.textContent
    if (title) {
      document.title = title
    } else {
      const h1 = document.querySelector("h1")
      title = h1?.innerText ?? h1?.textContent ?? url.pathname
    }
    if (announcer.textContent !== title) {
      announcer.textContent = title
    }
    announcer.dataset.persist = ""
    html.body.appendChild(announcer)

    // morph body
    micromorph(document.body, html.body)

    // scroll into place and add history
    if (!isBack) {
      if (url.hash) {
        const el = document.getElementById(decodeURIComponent(url.hash.substring(1)))
        el?.scrollIntoView()
      } else {
        window.scrollTo({ top: 0 })
      }
    }

    // now, patch head
    const elementsToRemove = document.head.querySelectorAll(":not([spa-preserve])")
    elementsToRemove.forEach((el) => el.remove())
    const elementsToAdd = html.head.querySelectorAll(":not([spa-preserve])")
    elementsToAdd.forEach((el) => document.head.appendChild(el))

    // delay setting the url until now
    if (!isBack) {
      history.pushState({}, "", url)
    }
    notifyNav(getFullSlug(window))
    delete announcer.dataset.persist
  }

  // Use View Transition if available
  if (startViewTransition) {
    try {
      await startViewTransition(() => performNavigation())
    } catch (error) {
      console.warn('View Transition failed, falling back to normal navigation:', error)
      await performNavigation()
    }
  } else {
    await performNavigation()
  }
}

// Debugging helper
function attachViewTransitionDebugger() {
  if (document.startViewTransition) {
    const originalStartViewTransition = document.startViewTransition.bind(document)
    
    document.startViewTransition = function(...args) {
      console.log('View Transition Started', { thisValue: this, args })
      try {
        return originalStartViewTransition(...args)
      } catch (error) {
        console.error('View Transition Error:', error)
        throw error
      }
    }
  }
}

// Call this early in your initialization
// attachViewTransitionDebugger()

window.spaNavigate = navigate

function createRouter() {
  if (typeof window !== "undefined") {
    window.addEventListener("click", async (event) => {
      const { url } = getOpts(event) ?? {}
      // dont hijack behaviour, just let browser act normally
      if (!url || event.ctrlKey || event.metaKey) return
      event.preventDefault()

      if (isSamePage(url) && url.hash) {
        const el = document.getElementById(decodeURIComponent(url.hash.substring(1)))
        el?.scrollIntoView()
        history.pushState({}, "", url)
        return
      }

      try {
        navigate(url, false)
      } catch (e) {
        window.location.assign(url)
      }
    })

    window.addEventListener("popstate", (event) => {
      const { url } = getOpts(event) ?? {}
      if (window.location.hash && window.location.pathname === url?.pathname) return
      try {
        navigate(new URL(window.location.toString()), true)
      } catch (e) {
        window.location.reload()
      }
      return
    })
  }

  return new (class Router {
    go(pathname: RelativeURL) {
      const url = new URL(pathname, window.location.toString())
      return navigate(url, false)
    }

    back() {
      return window.history.back()
    }

    forward() {
      return window.history.forward()
    }
  })()
}

createRouter()
notifyNav(getFullSlug(window))

if (!customElements.get("route-announcer")) {
  const attrs = {
    "aria-live": "assertive",
    "aria-atomic": "true",
    style:
      "position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px",
  }

  customElements.define(
    "route-announcer",
    class RouteAnnouncer extends HTMLElement {
      constructor() {
        super()
      }
      connectedCallback() {
        for (const [key, value] of Object.entries(attrs)) {
          this.setAttribute(key, value)
        }
      }
    },
  )
}


function addViewTransitionStyles() {
  const style = document.createElement('style')
  style.textContent = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    ::view-transition-old(root) {
      z-index: 1;
    }

    ::view-transition-new(root) {
      z-index: 2;
    }

    .page {
      view-transition-name: page;
    }

    @keyframes fade-in {
      from { opacity: 0; }
    }

    @keyframes fade-out {
      to { opacity: 0; }
    }

    ::view-transition-old(page),
    ::view-transition-new(page) {
      animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both fade-in;
      animation-name: fade-in, fade-out;
    }
  `
  document.head.appendChild(style)
}

// Rest of the existing code remains the same...

// Call this function to add View Transition styles
addViewTransitionStyles()