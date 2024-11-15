// Get the copy-link element
const copyLinkEl = document.getElementById('copy-link');
const copiedPopupEl = document.getElementById('copied-popup');

// Check if copyLinkEl is not null
if (copyLinkEl && copiedPopupEl) {
  // Add click event listener to the copy-link element
  copyLinkEl.addEventListener('click', () => {
    // Get the data-url value
    const url = copyLinkEl.dataset.url!;

    // Copy the URL to the clipboard
    navigator.clipboard.writeText(url);

    // Show the copied popup
    copiedPopupEl.style.display = 'block';

    // Hide the copied popup after 2 seconds
    setTimeout(() => {
      copiedPopupEl.style.display = 'none';
    }, 1000);
  });

  // Initially hide the copied popup
    copiedPopupEl.style.display = 'none';
}

