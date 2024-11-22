// Check if .tts element exists
const audioPlayerContainer = document.getElementById('tts');
if (audioPlayerContainer != null) {
  const placeholderDiv = document.createElement('div');

  // Track whether the element is currently sticky
  let isSticky = false;
  let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let isVisible = true;

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

    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const parentWidth = audioPlayerContainer.parentElement.offsetWidth;
    const isMobileView = window.innerWidth <= 800;

    // Determine scroll direction
    const isScrollingDown = currentScrollTop > lastScrollTop;
    lastScrollTop = currentScrollTop;

    if (containerRect.bottom <= 0 && !isSticky) {
      audioPlayerContainer.classList.add('sticky-audio-player');
      
      if (isMobileView) {
        audioPlayerContainer.style.width = '100%';
        audioPlayerContainer.style.left = '0';
      } else {
        audioPlayerContainer.style.width = `${parentWidth}px`;
        audioPlayerContainer.style.left = 'auto';
      }

      placeholderDiv.style.display = 'block';
      isSticky = true;
    } 
    
    // Handle visibility when sticky
    if (isSticky) {
      if (isScrollingDown && isVisible) {
        // Scroll down: hide
        audioPlayerContainer.style.transform = 'translateY(-100%)';
        isVisible = false;
      } else if (!isScrollingDown && !isVisible) {
        // Scroll up: show
        audioPlayerContainer.style.transform = 'translateY(0)';
        isVisible = true;
      }
    }

    // Reset to original state
    if (placeholderRect.top >= 0 && isSticky) {
      audioPlayerContainer.classList.remove('sticky-audio-player');
      audioPlayerContainer.style.width = 'auto';
      audioPlayerContainer.style.left = 'auto';
      audioPlayerContainer.style.transform = 'translateY(0)';
      placeholderDiv.style.display = 'none';
      isSticky = false;
      isVisible = true;
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