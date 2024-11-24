const toggleExplorer = () => {
    const explorerEl = document.getElementById('explorer-el');
    if (explorerEl) {
        explorerEl.classList.toggle('desktop-only');
    }

    const articleEl = document.getElementById('center-content');
    if (articleEl) {
        articleEl.classList.toggle('desktop-only');
    }

    const shareButtonsEl = document.getElementById('share-buttons');
    if(shareButtonsEl) {
        shareButtonsEl.classList.toggle('desktop-only')
    }

    // Toggle the icons
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    if (menuIcon && closeIcon) {
        if (menuIcon.style.display === 'none') {
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        } else {
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        }
    }
};

document.getElementById('hamburger-menu')?.addEventListener('click', () => {
    toggleExplorer();
});


// sticky mobile header


// Track elements and state globally
let mobileHeader: HTMLElement | null = null;
let mobilePlaceholder: HTMLDivElement | null = null;
let isHeaderSticky = false;
let lastScrollYHeader = window.scrollY;
let isHeaderVisible = true;
let headerScrollDistance = 0;

// Configure scroll threshold (in pixels)
const MOBILE_SCROLL_THRESHOLD = 100;
// Reset scroll accumulation after this timeout (ms)
const MOBILE_SCROLL_RESET_TIMEOUT = 150;
let headerScrollTimeout: number | null = null;

// Initialize sticky header
function initializeMobileStickyHeader() {
    cleanupMobileHeader();
  
    mobileHeader = document.getElementById('mobile-header');
    if (!mobileHeader) return;

    // Check if we are in mobile view
    if (window.innerWidth > 800) {
        removeHeaderSticky(); // Ensure header is not sticky on non-mobile screens
        return;
    }

    // Create a placeholder for maintaining layout when the header is sticky
    if (!mobilePlaceholder) {
        mobilePlaceholder = document.createElement('div');
    }
    mobilePlaceholder.style.width = `${mobileHeader.offsetWidth}px`;
    mobilePlaceholder.style.height = mobileHeader.offsetHeight ? `${mobileHeader.offsetHeight}px` : '60px';
    mobilePlaceholder.style.display = 'none';
    mobilePlaceholder.classList.add('no-print');

    // Insert the placeholder if not already present
    if (!mobileHeader.parentNode?.contains(mobilePlaceholder)) {
        mobileHeader.parentNode?.insertBefore(mobilePlaceholder, mobileHeader.nextSibling);
    }

    // Reset the header to its non-sticky state
    mobileHeader.classList.remove('sticky-mobile-header');
    mobileHeader.style.opacity = '1';
    mobileHeader.style.pointerEvents = 'auto';
    isHeaderSticky = false;

    // Initialize scroll position
    lastScrollYHeader = window.scrollY;

    // Add event listeners for scrolling and resizing
    window.addEventListener('scroll', handleMobileStickyScroll);
    window.addEventListener('resize', handleResizeForMobileHeader);
}

// Function to handle resizing logic
function handleResizeForMobileHeader() {
    if (window.innerWidth <= 800) {
        // Reinitialize if switching to mobile view
        initializeMobileStickyHeader();
    } else {
        // Cleanup sticky behavior if switching to desktop view
        cleanupMobileHeader();
    }
}

// Function to make the header sticky
function makeHeaderSticky() {
    if (!mobileHeader || !mobilePlaceholder || isHeaderSticky) return;

    mobilePlaceholder.style.display = 'block';
    mobileHeader.classList.add('sticky-mobile-header');
    mobileHeader.style.width = '100%';
    mobileHeader.style.left = '0';

    isHeaderSticky = true;
}

// Function to remove the sticky state
function removeHeaderSticky() {
    if (!mobileHeader || !mobilePlaceholder || !isHeaderSticky) return;

    mobileHeader.classList.remove('sticky-mobile-header');
    mobileHeader.style.width = 'auto';
    mobileHeader.style.left = 'auto';
    mobilePlaceholder.style.display = 'none';

    isHeaderSticky = false;
}

// Adjusted handleMobileStickyScroll to utilize `makeHeaderSticky` and `removeHeaderSticky`
function handleMobileStickyScroll() {
    if (!mobileHeader || !mobilePlaceholder) return;

    const containerRect = mobileHeader.getBoundingClientRect();
    const placeholderRect = mobilePlaceholder.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollYHeader;
    const isScrollingDown = scrollDelta > 0;

    lastScrollYHeader = currentScrollY;

    // Update scroll accumulation
    if ((isScrollingDown && headerScrollDistance < 0) || (!isScrollingDown && headerScrollDistance > 0)) {
        headerScrollDistance = 0; // Reset scroll distance if direction changes
    }
    headerScrollDistance += scrollDelta;

    // Reset scroll accumulation after timeout
    if (headerScrollTimeout) {
        window.clearTimeout(headerScrollTimeout);
    }
    headerScrollTimeout = window.setTimeout(() => {
        headerScrollDistance = 0;
    }, MOBILE_SCROLL_RESET_TIMEOUT);

    // Determine sticky state
    const shouldBeSticky = containerRect.bottom <= 0 && !isHeaderSticky;
    const shouldNotBeSticky = placeholderRect.top > 0 && isHeaderSticky;

    if (shouldBeSticky) {
        makeHeaderSticky();
    } else if (shouldNotBeSticky) {
        removeHeaderSticky();
    }

    // Handle visibility toggle when sticky
    if (isHeaderSticky) {
        if (isScrollingDown && headerScrollDistance > MOBILE_SCROLL_THRESHOLD && isHeaderVisible) {
            isHeaderVisible = false;
            headerScrollDistance = 0; // Reset after state change
        } else if (!isScrollingDown && headerScrollDistance < -MOBILE_SCROLL_THRESHOLD && !isHeaderVisible) {
            isHeaderVisible = true;
            headerScrollDistance = 0; // Reset after state change
        }

        const footer = document.querySelector('footer');
        const footerRect = footer?.getBoundingClientRect();
        const hasFooterOverlap = footerRect && (window.innerHeight - footerRect.top) > 0;
        const shouldBeVisible = isHeaderVisible && !hasFooterOverlap;

        mobileHeader.style.opacity = shouldBeVisible ? '1' : '0';
        mobileHeader.style.pointerEvents = shouldBeVisible ? 'auto' : 'none';
    }
}

// Cleanup function to reset state
function cleanupMobileHeader() {
    window.removeEventListener('scroll', handleMobileStickyScroll);
    window.removeEventListener('resize', handleResizeForMobileHeader);

    // Clean up old placeholder if it exists
    mobilePlaceholder?.remove();

    // Clean up timeout
    if (headerScrollTimeout) {
        window.clearTimeout(headerScrollTimeout);
        headerScrollTimeout = null;
    }

    // Reset state
    mobileHeader = null;
    mobilePlaceholder = null;
    isHeaderSticky = false;
    isHeaderVisible = true;
    headerScrollDistance = 0;
}

// Initialize on page load
window.addEventListener('load', initializeMobileStickyHeader);

// Re-initialize when navigation occurs
document.addEventListener('nav', initializeMobileStickyHeader);