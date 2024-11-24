// Track elements and state globally
let audioPlayerContainer: HTMLElement | null = null;
let placeholderDiv: HTMLDivElement | null = null;
let isSticky = false;
let lastScrollY = window.scrollY;
let isPlayerVisible = true;

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
  
  // Initialize last scroll position
  lastScrollY = window.scrollY;
  
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

  // Determine scroll direction
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > lastScrollY;
  lastScrollY = currentScrollY;

  // Check if we should make it sticky
  const shouldBeSticky = containerRect.bottom <= 0 && !isSticky;
  const shouldNotBeSticky = placeholderRect.top > 0 && isSticky;

  if (shouldBeSticky) {
    // First show placeholder to prevent content jump
    placeholderDiv.style.display = 'block';
    
    // Then make the player sticky
    audioPlayerContainer.classList.add('sticky-audio-player');
    
    if (isMobileView) {
      audioPlayerContainer.style.width = '100%';
      audioPlayerContainer.style.left = '0';
    } else {
      audioPlayerContainer.style.width = `${parentWidth}px`;
      audioPlayerContainer.style.left = 'auto';
    }
    
    // Set initial visibility based on scroll direction
    isPlayerVisible = !isScrollingDown;
    
    // Set initial opacity without transition for instant effect
    audioPlayerContainer.style.transition = 'none';
    audioPlayerContainer.style.opacity = isPlayerVisible ? '1' : '0';
    audioPlayerContainer.style.pointerEvents = isPlayerVisible ? 'auto' : 'none';
    
    // Re-enable transitions after initial state is set
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
  }

  // Handle player visibility based on scroll direction when sticky
  if (isSticky) {
    if (isScrollingDown) {
      // Hide player when scrolling down
      isPlayerVisible = false;
    } else {
      // Show player when scrolling up
      isPlayerVisible = true;
    }

    // Handle footer overlap
    const hasFooterOverlap = footerRect && (window.innerHeight - footerRect.top) > 0;
    
    // Set visibility based on both scroll direction and footer overlap
    const shouldBeVisible = isPlayerVisible && !hasFooterOverlap;
    
    // Apply visibility changes
    audioPlayerContainer.style.opacity = shouldBeVisible ? '1' : '0';
    audioPlayerContainer.style.pointerEvents = shouldBeVisible ? 'auto' : 'none';
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
  isPlayerVisible = true;
}

// Initialize on page load
window.addEventListener('load', initializeStickyPlayer);

// Re-initialize when navigation occurs
document.addEventListener('nav', initializeStickyPlayer);


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