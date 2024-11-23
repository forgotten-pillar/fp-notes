import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const TranslateButton: QuartzComponent = ({ fileData, displayClass, ctx }: QuartzComponentProps) => {
    
    function getFirstForeignLanguage() {
        const languages = navigator.languages || [navigator.language || 'en'];
    
        // Filter out English ('en') and its variations like 'en-US', 'en-GB'
        const foreignLanguage = languages.find(lang => !lang.startsWith('en'));
    
        // Return the first foreign language, or 'en' if none exists
        return foreignLanguage || 'en';
    }

    const userForeignLanguage = getFirstForeignLanguage();
    
    const link = `https://${ctx.cfg.configuration.baseUrl}/${fileData.slug}`
    const translateUrl = `https://translate.google.com/translate?hl=${userForeignLanguage}&sl=auto&u=${encodeURIComponent(link)}`;

  return <a href={translateUrl} class={classNames(displayClass, 'google-translate')} id="google-translate" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-languages"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg></a>
}


export default (() => TranslateButton) satisfies QuartzComponentConstructor