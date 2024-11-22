// Typescript for sticky audio player behavior
const audioPlayerContainer = document.getElementById('tts') as HTMLDivElement;
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
    const containerRect = audioPlayerContainer.getBoundingClientRect();
    const parentWidth = audioPlayerContainer.parentElement!.offsetWidth;
    const placeholderRect = placeholderDiv.getBoundingClientRect();
  
    if (containerRect.bottom <= 0 && !isSticky) {
      audioPlayerContainer.classList.add('sticky-audio-player');
      audioPlayerContainer.style.width = `${parentWidth}px`; // Set explicit width
      placeholderDiv.style.display = 'block';
      isSticky = true;
    } else if (placeholderRect.top >= 0 && isSticky) {
      audioPlayerContainer.classList.remove('sticky-audio-player');
      audioPlayerContainer.style.width = 'auto'; // Reset to original
      placeholderDiv.style.display = 'none';
      isSticky = false;
    }
  }

// Add scroll event listener
window.addEventListener('scroll', handleStickyScroll);

// Optional cleanup
function cleanup() {
  window.removeEventListener('scroll', handleStickyScroll);
}