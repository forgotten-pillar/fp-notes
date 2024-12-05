// Function to initialize the listeners
const initializeCopyListeners = () => {
  const copyLinkEl = document.getElementById('copy-link');
  const copiedPopupEl = document.getElementById('copied-popup');
  const headingLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-extra-class="heading-link"]');

  if (copyLinkEl && copiedPopupEl) {
    copyLinkEl.addEventListener('click', () => {
      const url = copyLinkEl.dataset.url!;
      navigator.clipboard.writeText(url);

      // Show the copied popup (position it near the copyLinkEl)
      const rect = copyLinkEl.getBoundingClientRect();
      positionPopup(copiedPopupEl, rect);

      setTimeout(() => {
        copiedPopupEl.style.display = 'none';
      }, 1000);
    });

    copiedPopupEl.style.display = 'none';
  }

  if (headingLinks.length > 0 && copyLinkEl) {
    headingLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const headingAnchor = link.getAttribute('href') || '';
        const fullUrl = (copyLinkEl.dataset.url || '') + headingAnchor;

        navigator.clipboard.writeText(fullUrl);

        if (copiedPopupEl) {
          // Get the position of the clicked link
          const rect = link.getBoundingClientRect();
          positionPopup(copiedPopupEl, rect);

          // Show the popup
          copiedPopupEl.style.display = 'block';
          setTimeout(() => {
            copiedPopupEl.style.display = 'none';
          }, 1000);
        }
      });
    });
  }
};

// Function to position the popup next to an element
const positionPopup = (popup: HTMLElement, rect: DOMRect) => {
  if (!popup) return;

  // Calculate the desired position
  const popupWidth = popup.offsetWidth;
  const viewportWidth = window.innerWidth;

  // Center horizontally, align below
  let left = rect.left + rect.width / 2 - popupWidth / 2 + window.scrollX;
  const top = rect.bottom + 10 + window.scrollY; // Add margin below the element

  // Ensure the popup stays within the viewport
  if (left < 0) {
    left = 10; // Minimum left margin
  } else if (left + popupWidth > viewportWidth) {
    left = viewportWidth - popupWidth - 10; // Adjust to avoid overflow
  }

  // Apply styles
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.style.display = 'block';
};
// Function to clean up old listeners (optional if necessary)
const cleanupListeners = () => {
  const copyLinkEl = document.getElementById('copy-link');
  const headingLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-extra-class="heading-link"]');

  if (copyLinkEl) {
    const newCopyLinkEl = copyLinkEl.cloneNode(true);
    copyLinkEl.parentNode?.replaceChild(newCopyLinkEl, copyLinkEl);
  }

  headingLinks.forEach((link) => {
    const newLink = link.cloneNode(true) as HTMLAnchorElement;
    link.parentNode?.replaceChild(newLink, link);
  });
};

// Monitor for page changes
const monitorPageChanges = () => {
  // Assuming you have a custom event for page changes
  document.addEventListener('nav', () => {
    // Clean up old listeners
    cleanupListeners();

    // Initialize listeners for the new page
    initializeCopyListeners();
  });
};

// Initialize for the first load
initializeCopyListeners();
monitorPageChanges();