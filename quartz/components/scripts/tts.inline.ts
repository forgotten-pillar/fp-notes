// Track elements and state globally
let audioPlayerContainer: HTMLElement | null = null;
let placeholderDiv: HTMLDivElement | null = null;
let isSticky = false;

// Initialize sticky player
function initializeStickyPlayer() {
  // Reset previous state
  cleanup();
  
  audioPlayerContainer = document.getElementById('tts');
  if (!audioPlayerContainer) return;

  // Create new placeholder
  placeholderDiv = document.createElement('div');
  
  // Clone dimensions of original container
  placeholderDiv.style.width = `${audioPlayerContainer.offsetWidth}px`;
  placeholderDiv.style.height = audioPlayerContainer.offsetHeight ? `${audioPlayerContainer.offsetHeight}px` : '90px';
  placeholderDiv.style.display = 'none';
  
  // Insert placeholder
  audioPlayerContainer.parentNode?.insertBefore(placeholderDiv, audioPlayerContainer.nextSibling);
  
  // Add event listeners
  window.addEventListener('resize', handleStickyScroll);
  window.addEventListener('scroll', handleStickyScroll);
}

function handleStickyScroll() {
  if (!audioPlayerContainer || !placeholderDiv) return;

  if (!audioPlayerContainer.parentElement?.offsetWidth) return;

  const parentWidth = audioPlayerContainer.parentElement.offsetWidth;
  const isMobileView = window.innerWidth <= 800;

  // Get the footer's position
  const footer = document.querySelector('footer');
  const footerRect = footer?.getBoundingClientRect();

  // Check if we should make it sticky based on placeholder position
  const placeholderTop = placeholderDiv.getBoundingClientRect().top;
  const shouldBeSticky = placeholderTop < 0;

  // Only update DOM if state actually changes
  if (shouldBeSticky !== isSticky) {
    if (shouldBeSticky) {
      placeholderDiv.style.display = 'block';
      audioPlayerContainer.classList.add('sticky-audio-player');
      
      if (isMobileView) {
        audioPlayerContainer.style.width = '100%';
        audioPlayerContainer.style.left = '0';
      } else {
        audioPlayerContainer.style.width = `${parentWidth}px`;
        audioPlayerContainer.style.left = 'auto';
      }
    } else {
      audioPlayerContainer.classList.remove('sticky-audio-player');
      audioPlayerContainer.style.width = 'auto';
      audioPlayerContainer.style.left = 'auto';
      placeholderDiv.style.display = 'none';
    }
    
    isSticky = shouldBeSticky;
  }

  // Handle footer overlap
  if (footerRect && isSticky) {
    const overlap = window.innerHeight - footerRect.top;
    audioPlayerContainer.style.opacity = overlap > 0 ? '0' : '1';
    audioPlayerContainer.style.pointerEvents = overlap > 0 ? 'none' : 'auto';
  }
}

function cleanup() {
  window.removeEventListener('resize', handleStickyScroll);
  window.removeEventListener('scroll', handleStickyScroll);
  
  // Clean up old placeholder if it exists
  placeholderDiv?.remove();
  
  // Reset state
  audioPlayerContainer = null;
  placeholderDiv = null;
  isSticky = false;
}

// Initialize on page load
window.addEventListener('load', initializeStickyPlayer);

// Re-initialize when navigation occurs
document.addEventListener('nav', initializeStickyPlayer);

function replaceWidgetTagWithIframe(): void {
  const divs = document.querySelectorAll<HTMLDivElement>("#elevenlabs-audionative-widget");

  divs.forEach((div) => {
    // Load properties from the 'div' tag
    const width = div.getAttribute("data-width") || "300";
    const height = div.getAttribute("data-height") || "150";
    const frameBorder = div.getAttribute("data-frameBorder") || "0";
    const scrolling = div.getAttribute("data-scrolling") || "no";
    const publicUserId = div.getAttribute("data-publicUserId") || "";
    const small = div.hasAttribute("data-small") ? `&small=${div.getAttribute("data-small")}` : "";
    const textColor = div.hasAttribute("data-textColor") ? `&textColor=${div.getAttribute("data-textColor")}` : "";
    const backgroundColor = div.hasAttribute("data-backgroundColor") ? `&backgroundColor=${div.getAttribute("data-backgroundColor")}` : "";
    const projectId = div.hasAttribute("data-projectId") ? `&projectId=${div.getAttribute("data-projectId")}` : "";
    const playerUrl = div.getAttribute("data-playerUrl") || "https://elevenlabs.io/player";
    const qa = div.hasAttribute("data-qa") ? `&qa=${div.getAttribute("data-qa")}` : "";

    const src = `${playerUrl}?publicUserId=${publicUserId}${projectId}${textColor}${backgroundColor}${small}${qa}`;

    const iframeTag = document.createElement("iframe");
    iframeTag.id = "AudioNativeElevenLabsPlayer";
    iframeTag.width = width;
    iframeTag.height = height;
    iframeTag.style.maxHeight = `${height}px`;
    iframeTag.frameBorder = frameBorder;
    iframeTag.scrolling = scrolling;
    iframeTag.src = src;

    div.parentNode?.replaceChild(iframeTag, div);
  });
}

// Initialize widget on load and navigation
window.addEventListener('load', replaceWidgetTagWithIframe);
document.addEventListener('nav', () => {
  // Small delay to ensure DOM is updated
  setTimeout(replaceWidgetTagWithIframe, 0);
});

// Listen for messages from the iframe
window.addEventListener("message", (event: MessageEvent) => {
  if (event.data === "audioNativeUrlRequest") {
    const frame = document.getElementById("AudioNativeElevenLabsPlayer") as HTMLIFrameElement | null;
    const faviconElements = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');

    if (frame?.contentWindow) {
      const message = {
        id: "audioNativeUrlResponse",
        url: window.location.href,
        favicons: Array.from(faviconElements).map((element) => ({
          href: element.href,
          sizes: Array.from(element.sizes).join(" "),
        })),
      };
      frame.contentWindow.postMessage(message, "*");
    }
  }

  if (event.data === "audioNativeHideRequest") {
    const frame = document.getElementById("AudioNativeElevenLabsPlayer") as HTMLIFrameElement | null;
    if (frame) {
      frame.height = "0";
    }
  }
});

window.addEventListener("beforeunload", () => {
  const frame = document.getElementById("AudioNativeElevenLabsPlayer") as HTMLIFrameElement | null;
  if (frame) {
    // Trigger the unload event on the iframe
    frame.remove();
  }
});