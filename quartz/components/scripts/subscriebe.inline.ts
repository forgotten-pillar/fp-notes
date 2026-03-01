document.addEventListener("nav", () => {
  const container = document.querySelector(".email-subscribe-container")
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
})

