document.addEventListener("nav", () => {
  const container = document.querySelector(".email-subscribe-container") as HTMLElement | null
  if (!container) return

  const form = container.querySelector("form")
  const messageEl = container.querySelector(".subscribe-message") as HTMLElement | null
  if (!form || !messageEl) return

  const submitBtn = form.querySelector(".subscribe-btn") as HTMLButtonElement | null
  const emailInput = form.querySelector(".email-input") as HTMLInputElement | null
  if (!submitBtn || !emailInput) return

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

  // --- Web Push subscription block ---
  setupPushBlock(container)
})

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i)
  return output
}

function setupPushBlock(container: HTMLElement) {
  const block = container.querySelector(".push-subscribe-block") as HTMLElement | null
  if (!block) return

  const btn = block.querySelector(".push-subscribe-btn") as HTMLButtonElement | null
  const label = block.querySelector(".push-subscribe-btn-label") as HTMLElement | null
  const msg = block.querySelector(".push-subscribe-message") as HTMLElement | null
  const iosHint = block.querySelector(".push-ios-hint") as HTMLElement | null
  if (!btn || !label || !msg || !iosHint) return

  const vapidKey = container.getAttribute("data-push-vapid-key") || ""
  const subscribeUrl = container.getAttribute("data-push-subscribe-url") || ""
  const unsubscribeUrl = container.getAttribute("data-push-unsubscribe-url") || ""

  // Graceful degradation: hide the entire block if config is missing.
  if (!subscribeUrl || !unsubscribeUrl) {
    block.style.display = "none"
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

  if (!pushSupported) {
    if (isIOS && !isStandalone) {
      btn.style.display = "none"
      iosHint.style.display = "block"
      return
    }
    block.style.display = "none"
    return
  }

  if (isIOS && !isStandalone) {
    btn.style.display = "none"
    iosHint.style.display = "block"
    return
  }

  function showPushMessage(text: string, type: "success" | "error") {
    if (!msg) return
    msg.textContent = text
    msg.className = `push-subscribe-message ${type}`
    msg.style.display = "block"
  }

  function clearPushMessage() {
    if (!msg) return
    msg.textContent = ""
    msg.className = "push-subscribe-message"
    msg.style.display = "none"
  }

  type PushState = "default" | "subscribed" | "denied"

  async function currentState(): Promise<PushState> {
    if (Notification.permission === "denied") return "denied"
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) return "subscribed"
    } catch (_e) {
      // ignore — fall through to default
    }
    return "default"
  }

  function renderState(state: PushState) {
    if (!btn || !label) return
    btn.disabled = false
    btn.dataset.state = state
    if (state === "denied") {
      btn.disabled = true
      label.textContent = "Notifications blocked — enable in browser settings"
    } else if (state === "subscribed") {
      label.textContent = "✓ Notifications enabled — Click to disable"
    } else {
      label.textContent = "🔔 Enable browser notifications"
    }
  }

  async function refresh() {
    renderState(await currentState())
  }

  async function doSubscribe() {
    if (!btn) return
    btn.disabled = true
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
    if (!btn) return
    btn.disabled = true
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

  async function onClick() {
    const state = btn?.dataset.state as PushState | undefined
    if (state === "subscribed") {
      await doUnsubscribe()
    } else {
      await doSubscribe()
    }
  }

  btn.addEventListener("click", onClick)
  window.addCleanup(() => btn.removeEventListener("click", onClick))

  refresh()
}
