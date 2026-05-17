let deferredPrompt: any = null

const showAllButtons = () => {
  document.querySelectorAll<HTMLElement>(".install-pwa-btn").forEach((el) => {
    el.style.display = "inline-flex"
  })
}

const hideAllButtons = () => {
  document.querySelectorAll<HTMLElement>(".install-pwa-btn").forEach((el) => {
    el.style.display = "none"
  })
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  deferredPrompt = e
  if (!isStandalone()) {
    showAllButtons()
  }
})

window.addEventListener("appinstalled", () => {
  deferredPrompt = null
  hideAllButtons()
})

document.addEventListener("nav", () => {
  if (isStandalone()) {
    hideAllButtons()
    return
  }

  if (deferredPrompt) {
    showAllButtons()
  }

  const buttons = document.querySelectorAll<HTMLButtonElement>(".install-pwa-btn")
  const onClick = async (_e: Event) => {
    if (!deferredPrompt) return
    try {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } finally {
      deferredPrompt = null
      hideAllButtons()
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", onClick)
    window.addCleanup(() => btn.removeEventListener("click", onClick))
  })
})
