// Track elements and state globally
let audioPlayerContainer: HTMLElement | null = null;
let placeholderDiv: HTMLDivElement | null = null;
let isSticky = false;
let lastScrollY = window.scrollY;
let isPlayerVisible = true;
let scrollDistance = 0;

// Configure scroll threshold (in pixels)
const SCROLL_THRESHOLD = 100;
// Reset scroll accumulation after this timeout (ms)
const SCROLL_RESET_TIMEOUT = 150;
let scrollTimeout: number | null = null;

// Initialize sticky player
function initializeStickyPlayer() {
  cleanup();

  audioPlayerContainer = document.getElementById('tts');
  if (!audioPlayerContainer) return;

  placeholderDiv = document.createElement('div');
  placeholderDiv.style.width = `${audioPlayerContainer.offsetWidth}px`;
  placeholderDiv.style.height = audioPlayerContainer.offsetHeight ? `${audioPlayerContainer.offsetHeight}px` : '90px';
  placeholderDiv.style.display = 'none';
  placeholderDiv.classList.add('no-print');

  audioPlayerContainer.parentNode?.insertBefore(placeholderDiv, audioPlayerContainer.nextSibling);

  lastScrollY = window.scrollY;

  // Evaluate sticky state immediately on initialization
  handleStickyScroll();

  // Add event listeners
  window.addEventListener('resize', handleStickyScroll);
  window.addEventListener('scroll', handleStickyScroll);
}

function handleStickyScroll() {
  if (!audioPlayerContainer || !placeholderDiv) return;

  const containerRect = audioPlayerContainer.getBoundingClientRect();
  const placeholderRect = placeholderDiv.getBoundingClientRect();

  if (!audioPlayerContainer.parentElement?.offsetWidth) return;

  const parentWidth = audioPlayerContainer.parentElement.offsetWidth;
  const isMobileView = window.innerWidth <= 800;

  // Get the footer's position
  const footer = document.querySelector('footer');
  const footerRect = footer?.getBoundingClientRect();

  // Determine scroll direction and distance
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  const isScrollingDown = scrollDelta > 0;

  // Update lastScrollY after calculating scrollDelta
  lastScrollY = currentScrollY;

  // Handle scroll accumulation logic
  if ((isScrollingDown && scrollDistance < 0) || (!isScrollingDown && scrollDistance > 0)) {
    // Reset scroll distance if direction changes significantly
    scrollDistance = 0;
  }
  scrollDistance += scrollDelta;

  // Reset scroll accumulation after timeout
  if (scrollTimeout) {
    window.clearTimeout(scrollTimeout);
  }
  scrollTimeout = window.setTimeout(() => {
    scrollDistance = 0;
  }, SCROLL_RESET_TIMEOUT);

  // Sticky state management
  const shouldBeSticky = containerRect.bottom <= 0 && !isSticky;
  const shouldNotBeSticky = placeholderRect.top > 0 && isSticky;

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

    isPlayerVisible = !isScrollingDown;
    audioPlayerContainer.style.transition = 'none';
    audioPlayerContainer.style.opacity = isPlayerVisible ? '1' : '0';
    audioPlayerContainer.style.pointerEvents = isPlayerVisible ? 'auto' : 'none';

    setTimeout(() => {
      if (audioPlayerContainer) {
        audioPlayerContainer.style.transition = 'opacity 0.3s ease-in-out';
      }
    }, 0);

    isSticky = true;
  } else if (shouldNotBeSticky) {
    audioPlayerContainer.classList.remove('sticky-audio-player');
    audioPlayerContainer.style.width = 'auto';
    audioPlayerContainer.style.left = 'auto';
    audioPlayerContainer.style.opacity = '1';
    audioPlayerContainer.style.pointerEvents = 'auto';
    placeholderDiv.style.display = 'none';
    isSticky = false;
    isPlayerVisible = true;
    scrollDistance = 0; // Reset scroll distance when not sticky
  }

  // Handle visibility toggle when sticky
  if (isSticky) {
    if (isScrollingDown && scrollDistance > SCROLL_THRESHOLD && isPlayerVisible) {
      isPlayerVisible = false;
      scrollDistance = 0; // Reset after state change
    } else if (!isScrollingDown && scrollDistance < -SCROLL_THRESHOLD && !isPlayerVisible) {
      isPlayerVisible = true;
      scrollDistance = 0; // Reset after state change
    }

    // Handle footer overlap
    const hasFooterOverlap = footerRect && (window.innerHeight - footerRect.top) > 0;

    const shouldBeVisible = isPlayerVisible && !hasFooterOverlap;

    audioPlayerContainer.style.opacity = shouldBeVisible ? '1' : '0';
    audioPlayerContainer.style.pointerEvents = shouldBeVisible ? 'auto' : 'none';
  }
}

function cleanup() {
  window.removeEventListener('resize', handleStickyScroll);
  window.removeEventListener('scroll', handleStickyScroll);

  // Clean up old placeholder if it exists
  placeholderDiv?.remove();

  // Clean up timeout
  if (scrollTimeout) {
    window.clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }

  // Reset state
  audioPlayerContainer = null;
  placeholderDiv = null;
  isSticky = false;
  isPlayerVisible = true;
  scrollDistance = 0;
}

// Reinitialize sticky player on navigation
document.addEventListener('nav', () => {
  initializeStickyPlayer();
});

// Initialize on page load
window.addEventListener('load', initializeStickyPlayer);

// BUG 1: IF IT IS reloaded in the middle of the page, then there is no effect of hiding and showing based on scroll
// neither when you come to the top of the page that there is a replacement of sticky element

// BUG 2: when you change your navigation (nav event), you loose the placeholder div



// ElevenLabs Script
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