// @ts-ignore
import script from './scripts/sharebuttons.inline'
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ShareButtons: QuartzComponent = ({fileData, displayClass, cfg} : QuartzComponentProps) => {
    const path = fileData.frontmatter?.permalink ? fileData.frontmatter.permalink : fileData.slug !== 'index' ? fileData.slug : '';
    const link = `https://notefp.link/${path}`;
    const facebookAppId = '3807278449520612';
    const facebookLink = `https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=page&href=${encodeURIComponent(link)}&hashtag=#forgottenpillar`
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this note: ' + link)}`
    const mailLink = `mailto:?subject=${encodeURIComponent(`Forgotten Pillar Note: ${fileData.frontmatter?.title}`)}&body=${encodeURIComponent(`Check out this Forgotten Pillar Note on '${fileData.frontmatter?.title}': ${link}`)}`
    const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this note: ' + link)}`
    const telegramLink = `https://telegram.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Check out this note')}`

    return (
        <div id="share-buttons" class='share-panel'>
            <a href={facebookLink} target='_blank' data-type="facebook" aria-label="share with facebook" title="Share with Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href={twitterLink} target='_blank' data-type="x" aria-label="share with x" title="Share with X"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg></a>
            {/* <a href={whatsappLink} target='_blank' data-type="whatsapp" aria-label="share with whatsapp" title="Share with Whatsapp"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg></a> */}
            {/* <a href={telegramLink} target='_blank' data-type="telegram" aria-label="share with telegram" title="Share with telegram"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z"></path></svg></a> */}
            <a href={mailLink} target='_blank' data-type="email" aria-label="share via email" title="Share via email"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></a>
            <div id='copy-link' data-type='copy' data-url={link} title='Copy to clipboard'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></div>
            <div id='copied-popup'>Copied</div>
        </div>
    )
}

ShareButtons.afterDOMLoaded = script

export default (() => ShareButtons) satisfies QuartzComponentConstructor