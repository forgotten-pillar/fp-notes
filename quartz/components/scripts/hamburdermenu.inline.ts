const toggleExplorer = () => {
    const explorerEl = document.getElementById('explorer-el');
    if (explorerEl) {
        explorerEl.classList.toggle('desktop-only');
        explorerEl.classList.toggle('show-explorer');
    }
}

document.getElementById('hamburger-menu')?.addEventListener('click', () => {
    toggleExplorer();
});

document.getElementById('close-explorer')?.addEventListener('click', () => {
    toggleExplorer();
})