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
        audioPlayerContainer.style.translate = '0';
      } else {
        audioPlayerContainer.style.width = `${parentWidth}px`;
        audioPlayerContainer.style.left = 'auto';
        audioPlayerContainer.style.translate = '-12px';
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