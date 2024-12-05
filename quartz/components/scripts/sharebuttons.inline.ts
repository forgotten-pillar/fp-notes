// Function to initialize the listeners
const initializeCopyListeners = () => {
  const copyLinkEl = document.getElementById('copy-link');
  const copiedPopupEl = document.getElementById('copied-popup');
  const headingLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-extra-class="heading-link"]');

  if (copyLinkEl && copiedPopupEl) {
    copyLinkEl.addEventListener('click', () => {
      const url = copyLinkEl.dataset.url!;
      navigator.clipboard.writeText(url);

      // Show the copied popup
      copiedPopupEl.style.display = 'block';
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
          copiedPopupEl.style.display = 'block';
          setTimeout(() => {
            copiedPopupEl.style.display = 'none';
          }, 1000);
        }
      });
    });
  }
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