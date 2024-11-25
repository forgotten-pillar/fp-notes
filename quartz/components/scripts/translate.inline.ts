function getFirstForeignLanguage() {
    const languages = navigator.languages || [navigator.language || 'en'];

    // Filter out English ('en') and its variations like 'en-US', 'en-GB'
    const foreignLanguage = languages.find(lang => !lang.startsWith('en'));

    // Return the first foreign language, or 'en' if none exists
    return foreignLanguage || 'en';
}

function setupLanguage() {
    const linkElement = document.getElementById('google-translate') as HTMLAnchorElement
    if (linkElement) {
        const userForeignLanguage = getFirstForeignLanguage();

        // Replace the 'TARGET' in the href attribute with the user's foreign language
        linkElement.href = linkElement.href.replace('TARGET', userForeignLanguage);
    } else {
        console.error('Element with ID "google-translate" not found.');
    }
}

document.addEventListener("nav", setupLanguage);
setupLanguage();