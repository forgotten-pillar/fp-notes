// Get the copy-link element
const copyLinkEl = document.getElementById('copy-link');
const copiedPopupEl = document.getElementById('copied-popup');
const headingLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-extra-class="heading-link"]');

// Function to handle heading link clicks
const handleHeadingLinkClick = (event: MouseEvent) => {
  if (copyLinkEl && copiedPopupEl) {
    const clickedLink = event.currentTarget as HTMLAnchorElement;
    const baseUrl = copyLinkEl.dataset.url || ''; // Get the base URL from copyLinkEl
    const headingAnchor = clickedLink.getAttribute('href') || ''; // Get the href from the clicked link
    const fullUrl = baseUrl + headingAnchor; // Concatenate the base URL and the heading's href

    // Copy the full URL to the clipboard
    navigator.clipboard.writeText(fullUrl);

    // Show the copied popup
    copiedPopupEl.style.display = 'block';
    setTimeout(() => {
      copiedPopupEl.style.display = 'none';
    }, 1000);
  }
};

// Register event listeners
const registerHeadingLinks = () => {
  headingLinks.forEach((link) => {
    link.addEventListener('click', handleHeadingLinkClick);
  });
};

// Unregister event listeners
const unregisterHeadingLinks = () => {
  headingLinks.forEach((link) => {
    link.removeEventListener('click', handleHeadingLinkClick);
  });
};

// Check if copyLinkEl and copiedPopupEl exist, then initialize
if (copyLinkEl && copiedPopupEl) {
  // Add click event listener to the copy-link element
  copyLinkEl.addEventListener('click', () => {
    const url = copyLinkEl.dataset.url!;
    navigator.clipboard.writeText(url);

    // Show the copied popup
    copiedPopupEl.style.display = 'block';
    setTimeout(() => {
      copiedPopupEl.style.display = 'none';
    }, 1000);
  });

  // Initially hide the copied popup
  copiedPopupEl.style.display = 'none';
}

// Register heading link event listeners
if (headingLinks && headingLinks.length > 0) {
  registerHeadingLinks();
}

// Unregister listeners on page leave
window.addEventListener('beforeunload', () => {
  unregisterHeadingLinks();
});