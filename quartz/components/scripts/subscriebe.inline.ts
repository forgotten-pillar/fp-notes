document.addEventListener("nav", () => {
  const container = document.querySelector(".email-subscribe-container") as HTMLElement | null

  if (container) {
    const form = container.querySelector("form")
    const messageEl = container.querySelector(".subscribe-message") as HTMLElement | null
    const submitBtn = form?.querySelector(".subscribe-btn") as HTMLButtonElement | null
    const emailInput = form?.querySelector(".email-input") as HTMLInputElement | null

    if (form && messageEl && submitBtn && emailInput) {
      const originalBtnHTML = submitBtn.innerHTML

      function showMessage(text: string, type: "success" | "error") {
        if (!messageEl) return
        messageEl.textContent = text
        messageEl.className = `subscribe-message ${type}`
        messageEl.style.display = "block"
      }

      async function handleSubmit(e: Event) {
        e.preventDefault()
        if (!emailInput || !submitBtn) return

        const email = emailInput.value.trim()
        if (!email) return

        // Disable button and show loading state
        submitBtn.disabled = true
        submitBtn.innerHTML = "<span>Subscribing...</span>"

        try {
          const response = await fetch("https://forgottenpillar.com/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })

          const data = await response.json()

          if (data.success) {
            showMessage(data.message, "success")
            form?.reset()
          } else {
            showMessage(data.message || "Subscription failed. Please try again.", "error")
          }
        } catch {
          showMessage("Network error. Please check your connection and try again.", "error")
        } finally {
          submitBtn.disabled = false
          submitBtn.innerHTML = originalBtnHTML
        }
      }

      form.addEventListener("submit", handleSubmit)
      window.addCleanup(() => form.removeEventListener("submit", handleSubmit))
    }
  }

  // --- Web Push subscription buttons (Subscribe card + footer) ---
  setupPushButtons(container)
})

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i)
  return output
}

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'

const ICON_BELL = `<svg ${SVG_ATTRS}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>`

const ICON_BELL_PLUS = `<svg ${SVG_ATTRS}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M15 8h6"/><path d="M18 5v6"/><path d="M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332"/></svg>`

const ICON_BELL_CHECK = `<svg ${SVG_ATTRS}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 12 0c0 .898.06 1.708.166 2.43"/><path d="m16 19 2 2 4-4"/></svg>`

const ICON_BELL_MINUS = `<svg ${SVG_ATTRS}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M15 8h6"/><path d="M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332"/></svg>`

const ICON_BELL_OFF = `<svg ${SVG_ATTRS}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/></svg>`

type PushState = "idle" | "subscribed" | "denied" | "ios"

function setupPushButtons(container: HTMLElement | null) {
  const buttons = Array.from(
    document.querySelectorAll(".push-bell-btn"),
  ) as HTMLButtonElement[]
  if (buttons.length === 0) return

  const msg = container?.querySelector(".push-bell-message") as HTMLElement | null
  const iosHint = container?.querySelector(".push-ios-hint") as HTMLElement | null

  const vapidKey = container?.getAttribute("data-push-vapid-key") || ""
  const subscribeUrl = container?.getAttribute("data-push-subscribe-url") || ""
  const unsubscribeUrl = container?.getAttribute("data-push-unsubscribe-url") || ""

  // Graceful degradation: hide every push bell button if config is missing.
  if (!subscribeUrl || !unsubscribeUrl) {
    for (const b of buttons) b.style.display = "none"
    return
  }

  if (vapidKey === "REPLACE_WITH_VAPID_PUBLIC_KEY") {
    console.warn(
      "[push] vapidPublicKey is still the placeholder; subscribe will fail until it is set.",
    )
  }

  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  const pushSupported =
    "serviceWorker" in navigator && "PushManager" in window && "Notification" in window

  function renderState(state: PushState) {
    for (const btn of buttons) {
      const iconDefault = btn.querySelector(".icon-default") as HTMLElement | null
      const iconHover = btn.querySelector(".icon-hover") as HTMLElement | null
      if (!iconDefault || !iconHover) continue
      btn.dataset.state = state
      btn.disabled = state === "denied"
      if (state === "subscribed") {
        iconDefault.innerHTML = ICON_BELL_CHECK
        iconHover.innerHTML = ICON_BELL_MINUS
        btn.setAttribute("aria-label", "Notifications on — click to turn off")
        btn.title = "Notifications on — click to turn off"
      } else if (state === "denied") {
        iconDefault.innerHTML = ICON_BELL_OFF
        iconHover.innerHTML = ICON_BELL_OFF
        btn.setAttribute("aria-label", "Notifications blocked — enable in browser settings")
        btn.title = "Notifications blocked — enable in browser settings"
      } else if (state === "ios") {
        iconDefault.innerHTML = ICON_BELL
        iconHover.innerHTML = ICON_BELL
        btn.setAttribute("aria-label", "Notifications — add to Home Screen first")
        btn.title = "Notifications — add to Home Screen first"
      } else {
        iconDefault.innerHTML = ICON_BELL_PLUS
        iconHover.innerHTML = ICON_BELL_PLUS
        btn.setAttribute("aria-label", "Enable browser notifications")
        btn.title = "Enable browser notifications"
      }
    }
  }

  function setDisabledAll(disabled: boolean) {
    for (const btn of buttons) btn.disabled = disabled
  }

  // iOS Safari (non-standalone) cannot use Web Push; show the bell but route taps to the iOS hint.
  if (isIOS && !isStandalone) {
    renderState("ios")
    const onIosClick = () => {
      if (iosHint) iosHint.style.display = "block"
    }
    for (const btn of buttons) {
      btn.addEventListener("click", onIosClick)
      window.addCleanup(() => btn.removeEventListener("click", onIosClick))
    }
    return
  }

  if (!pushSupported) {
    for (const b of buttons) b.style.display = "none"
    return
  }

  function showPushMessage(text: string, type: "success" | "error") {
    if (!msg) return
    msg.textContent = text
    msg.className = `push-bell-message ${type}`
    msg.style.display = "block"
  }

  function clearPushMessage() {
    if (!msg) return
    msg.textContent = ""
    msg.className = "push-bell-message"
    msg.style.display = "none"
  }

  async function currentState(): Promise<PushState> {
    if (Notification.permission === "denied") return "denied"
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) return "subscribed"
    } catch (_e) {
      // ignore — fall through to idle
    }
    return "idle"
  }

  async function refresh() {
    renderState(await currentState())
  }

  async function doSubscribe() {
    setDisabledAll(true)
    clearPushMessage()
    try {
      const reg = await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      if (perm !== "granted") {
        showPushMessage(
          perm === "denied"
            ? "Notifications blocked — enable in browser settings."
            : "Notification permission was not granted.",
          "error",
        )
        await refresh()
        return
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const body = JSON.stringify({ ...sub.toJSON(), userAgent: navigator.userAgent })
      let ok = false
      try {
        const resp = await fetch(subscribeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        })
        ok = resp.ok
      } catch (_e) {
        ok = false
      }
      if (!ok) {
        try {
          await sub.unsubscribe()
        } catch (_e) {
          // best effort
        }
        showPushMessage("Could not save your subscription. Please try again later.", "error")
        await refresh()
        return
      }
      showPushMessage("You'll get a ping when new notes drop.", "success")
      await refresh()
    } catch (err) {
      console.warn("[push] subscribe failed:", err)
      showPushMessage("Push not yet configured — please try again later.", "error")
      await refresh()
    }
  }

  async function doUnsubscribe() {
    setDisabledAll(true)
    clearPushMessage()
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) {
        await refresh()
        return
      }
      const endpoint = sub.endpoint
      await sub.unsubscribe()
      fetch(unsubscribeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {
        // best-effort; UI already reflects unsubscribed state
      })
      showPushMessage("Notifications turned off.", "success")
      await refresh()
    } catch (err) {
      console.warn("[push] unsubscribe failed:", err)
      showPushMessage("Could not turn off notifications. Please try again.", "error")
      await refresh()
    }
  }

  async function onClick(e: Event) {
    const target = e.currentTarget as HTMLButtonElement | null
    const state = target?.dataset.state as PushState | undefined
    if (state === "subscribed") {
      await doUnsubscribe()
    } else {
      await doSubscribe()
    }
  }

  for (const btn of buttons) {
    btn.addEventListener("click", onClick)
    window.addCleanup(() => btn.removeEventListener("click", onClick))
  }

  refresh()
}
