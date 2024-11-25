import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/readingModeToggle.scss"
// @ts-ignore
import script from "./scripts/readingMode.inline"

export default (() => {
  function ReadingModeToggle({ displayClass }: QuartzComponentProps) {
    const toggleClass = ["reading-mode-toggle", displayClass].filter(x => x).join(" ")
    return <button class={toggleClass} title="阅读模式" aria-label="阅读模式">
      👓
    </button>
  }

  ReadingModeToggle.beforeDOMLoaded = script
  ReadingModeToggle.css = style

  return ReadingModeToggle
}) satisfies QuartzComponentConstructor