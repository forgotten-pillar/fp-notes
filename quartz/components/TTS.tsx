// @ts-ignore
import initTTSObserver from "./scripts/tts.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const TTS: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const tts = fileData.frontmatter?.tts
  
  const lightTheme = document.documentElement.getAttribute('saved-theme') !== 'dark';

  if (tts) {
    return (
      <div id="tts" class={classNames(displayClass, "tts")}>
        <div 
            id="elevenlabs-audionative-widget"
            data-height="90"
            data-width="100%"
            data-frameborder="no"
            data-scrolling="no"
            data-publicuserid="433d229fa1db09ffe64719ac56b9de8d83b026ef56baec5e177d3675d7fd6057"
            data-playerurl="https://elevenlabs.io/player/index.html"
            data-small="True"
            data-backgroundcolor={lightTheme ? '#fff' : '#1d2535'}
            data-color={lightTheme ? '#106a8f' : '#ebebec'}
        >
            Loading the Audio Player... Please reload the page...
        </div>
        <script src="https://elevenlabs.io/player/audioNativeHelper.js" type="text/javascript"></script>
      </div>
    )
  } else {
    return null
  }
}

// Make sure the script runs after DOM is loaded
TTS.afterDOMLoaded = initTTSObserver;

export default (() => TTS) satisfies QuartzComponentConstructor