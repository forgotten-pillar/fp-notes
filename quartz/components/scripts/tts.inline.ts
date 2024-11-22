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

    if(audioPlayerContainer == null) return;

    const containerRect = audioPlayerContainer.getBoundingClientRect();
    const placeholderRect = placeholderDiv.getBoundingClientRect();
    
    if(!audioPlayerContainer.parentElement || !audioPlayerContainer.parentElement.offsetWidth) {
      return;
    }

    const parentWidth = audioPlayerContainer.parentElement.offsetWidth;
    const isMobileView = window.innerWidth <= 800;

    if (containerRect.bottom <= 0 && !isSticky) {
      audioPlayerContainer.classList.add('sticky-audio-player');
      
      if (isMobileView) {
        // For mobile, set to 100% width and align to page start
        audioPlayerContainer.style.width = '100%';
        audioPlayerContainer.style.left = '0';
      } else {
        // For desktop, match parent width
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