// Check if .tts element exists
const audioPlayerContainer = document.getElementById('tts');
if (audioPlayerContainer != null) {
  const placeholderDiv = document.createElement('div');

  // Track whether the element is currently sticky
  let isSticky = false;

  // Clone dimensions of original container
  placeholderDiv.style.width = `${audioPlayerContainer.offsetWidth}px`;
  placeholderDiv.style.height = audioPlayerContainer.offsetHeight ? `${audioPlayerContainer.offsetHeight}px` : '90px';
  placeholderDiv.style.display = 'none';

  // Insert placeholder
  audioPlayerContainer.parentNode?.insertBefore(placeholderDiv, audioPlayerContainer.nextSibling);

  function handleStickyScroll() {
    if (audioPlayerContainer == null) return;
  
    const containerRect = audioPlayerContainer.getBoundingClientRect();
    const placeholderRect = placeholderDiv.getBoundingClientRect();
  
    if (!audioPlayerContainer.parentElement || !audioPlayerContainer.parentElement.offsetWidth) {
      return;
    }
  
    const parentWidth = audioPlayerContainer.parentElement.offsetWidth;
    const isMobileView = window.innerWidth <= 800;
  
    // Get the footer's position
    const footer = document.querySelector('footer');
    const footerRect = footer ? footer.getBoundingClientRect() : null;
  
    if (containerRect.bottom <= 0 && !isSticky) {
      audioPlayerContainer.classList.add('sticky-audio-player');
      
      if (isMobileView) {
        audioPlayerContainer.style.width = '100%';
        audioPlayerContainer.style.left = '0';
      } else {
        audioPlayerContainer.style.width = `${parentWidth}px`;
        audioPlayerContainer.style.left = 'auto';
      }
  
      placeholderDiv.style.display = 'block';
      isSticky = true;
    } else if (placeholderRect.top >= 0 && isSticky) {
      audioPlayerContainer.classList.remove('sticky-audio-player');
      audioPlayerContainer.style.width = 'auto';
      audioPlayerContainer.style.left = 'auto';
      placeholderDiv.style.display = 'none';
      isSticky = false;
    }
  
    // Adjust for footer overlap
    if (footerRect && isSticky) {
      const overlap = window.innerHeight - footerRect.top;
      if (overlap > 0) {
        audioPlayerContainer.style.opacity = '0';
        audioPlayerContainer.style.pointerEvents = 'none';
      } else {
        audioPlayerContainer.style.opacity = '1';
        audioPlayerContainer.style.pointerEvents = 'auto';
      }
    }
  }

  // Add resize event listener to handle view changes
  window.addEventListener('resize', handleStickyScroll);

  // Add scroll event listener
  window.addEventListener('scroll', handleStickyScroll);

  // Optional cleanup
  function cleanup() {
    window.removeEventListener('resize', handleStickyScroll);
    window.removeEventListener('scroll', handleStickyScroll);
  }
}

// elevenlabs script:

// function replaceWidgetTagWithIframe(): void {
//     const divs = document.querySelectorAll<HTMLDivElement>("#elevenlabs-audionative-widget");
  
//     divs.forEach((div) => {
//       // Load properties from the 'div' tag
//       const width = div.getAttribute("data-width") || "300";
//       const height = div.getAttribute("data-height") || "150";
//       const frameBorder = div.getAttribute("data-frameBorder") || "0";
//       const scrolling = div.getAttribute("data-scrolling") || "no";
//       const publicUserId = div.getAttribute("data-publicUserId") || "";
//       const small = div.hasAttribute("data-small") ? `&small=${div.getAttribute("data-small")}` : "";
//       const textColor = div.hasAttribute("data-textColor") ? `&textColor=${div.getAttribute("data-textColor")}` : "";
//       const backgroundColor = div.hasAttribute("data-backgroundColor") ? `&backgroundColor=${div.getAttribute("data-backgroundColor")}` : "";
//       const projectId = div.hasAttribute("data-projectId") ? `&projectId=${div.getAttribute("data-projectId")}` : "";
//       const playerUrl = div.getAttribute("data-playerUrl") || "https://elevenlabs.io/player";
//       const qa = div.hasAttribute("data-qa") ? `&qa=${div.getAttribute("data-qa")}` : "";
  
//       const src = `${playerUrl}?publicUserId=${publicUserId}${projectId}${textColor}${backgroundColor}${small}${qa}`;
  
//       const iframeTag = document.createElement("iframe");
//       iframeTag.id = "AudioNativeElevenLabsPlayer";
//       iframeTag.width = width;
//       iframeTag.height = height;
//       iframeTag.style.maxHeight = `${height}px`;
//       iframeTag.frameBorder = frameBorder;
//       iframeTag.scrolling = scrolling;
//       iframeTag.src = src;
  
//       div.parentNode?.replaceChild(iframeTag, div);
//     });
//   }
  
//   window.addEventListener("load", () => {
//     replaceWidgetTagWithIframe();
//   });
  
//   // Listen for messages from the iframe
//   window.addEventListener("message", (event: MessageEvent) => {
//     if (event.data === "audioNativeUrlRequest") {
//       const frame = document.getElementById("AudioNativeElevenLabsPlayer") as HTMLIFrameElement | null;
//       const faviconElements = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
  
//       if (frame?.contentWindow) {
//         const message = {
//           id: "audioNativeUrlResponse",
//           url: window.location.href,
//           favicons: Array.from(faviconElements).map((element) => ({
//             href: element.href,
//             sizes: Array.from(element.sizes).join(" "),
//           })),
//         };
//         frame.contentWindow.postMessage(message, "*");
//       }
//     }
  
//     if (event.data === "audioNativeHideRequest") {
//       const frame = document.getElementById("AudioNativeElevenLabsPlayer") as HTMLIFrameElement | null;
//       if (frame) {
//         frame.height = "0";
//       }
//     }
//   });
  
//   window.addEventListener("beforeunload", () => {
//     const frame = document.getElementById("AudioNativeElevenLabsPlayer") as HTMLIFrameElement | null;
//     if (frame) {
//       // Trigger the unload event on the iframe
//       frame.remove();
//     }
//   });
  
//   // Calling in case script was loaded after window.load event - useEffect in React or similar
// replaceWidgetTagWithIframe();