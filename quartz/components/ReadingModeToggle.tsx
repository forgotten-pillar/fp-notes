import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/readingModeToggle.scss"
// @ts-ignore
import script from "./scripts/readingMode.inline"

export default (() => {
  function ReadingModeToggle({ displayClass }: QuartzComponentProps) {
    const toggleClass = ["reading-mode-toggle", displayClass].filter(x => x).join(" ")
    return <button class={toggleClass} id="reading-mode-toggle-button" title="Reading Mode" aria-label="reading mode button">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
    </button>
  }

  ReadingModeToggle.beforeDOMLoaded = script
  ReadingModeToggle.css = style

  return ReadingModeToggle
}) satisfies QuartzComponentConstructor