const toggleExplorer = () => {
    const explorerEl = document.getElementById('explorer-el');
    if (explorerEl) {
        explorerEl.classList.toggle('desktop-only');
    }

    const articleEl = document.getElementById('center-content');
    if(articleEl) {
        articleEl.classList.toggle('desktop-only');
    }
}

document.getElementById('hamburger-menu')?.addEventListener('click', () => {
    toggleExplorer();
});

document.getElementById('close-explorer')?.addEventListener('click', () => {
    toggleExplorer();
})