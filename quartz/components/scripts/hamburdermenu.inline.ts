const toggleExplorer = () => {
    const explorerEl = document.getElementById('explorer-el');
    if (explorerEl) {
        explorerEl.classList.toggle('desktop-only');
    }

    const articleEl = document.getElementById('center-content');
    if (articleEl) {
        articleEl.classList.toggle('desktop-only');
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