// @ts-ignore
import script from './scripts/sharebuttons.inline'
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ShareButtons: QuartzComponent = ({fileData, displayClass, cfg} : QuartzComponentProps) => {
    const link = fileData.frontmatter?.permalink ? `https://notefp.link/${fileData.frontmatter.permalink}` : `https://${cfg.baseUrl}/${fileData.slug}`;
    const facebookAppId = '3807278449520612';
    const facebookLink = `https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=page&href=${encodeURIComponent(link)}&hashtag=#forgottenpillar`
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this note: ' + link)}`
    const mailLink = `mailto:?subject=${encodeURIComponent(`Forgotten Pillar Note: ${fileData.frontmatter?.title}`)}&body=${encodeURIComponent(`Check out this Forgotten Pillar Note on '${fileData.frontmatter?.title}': ${link}`)}`

    return (
        <div class='share-panel'>
            <a href={facebookLink} target='_blank' data-type="facebook" aria-label="share with facebook" title="Share with Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href={twitterLink} target='_blank' data-type="x" aria-label="share with x" title="Share with X"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg></a>
            <a href={mailLink} target='_blank' data-type="email" aria-label="share via email" title="Share via email"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></a>
            <div id='copy-link' data-type='copy' data-url={link} title='Copy to clipboard'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></div>
            <div id='copied-popup'>Copied</div>
        </div>
    )
}

ShareButtons.afterDOMLoaded = script

export default (() => ShareButtons) satisfies QuartzComponentConstructor