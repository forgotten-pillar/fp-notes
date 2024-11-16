import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import hamburgerScript from './scripts/hamburdermenu.inline'

function HamburgerMenu({ displayClass }: QuartzComponentProps) {
  return <div id='hamburger-menu' class={classNames(displayClass, "hamburder-menu")}>
    <svg id="menu-icon" class="lucide lucide-menu" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
    <svg id="close-icon" style="display: none" class="lucide lucide-x" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </div>
}

HamburgerMenu.afterDOMLoaded = hamburgerScript

export default (() => HamburgerMenu) satisfies QuartzComponentConstructor
