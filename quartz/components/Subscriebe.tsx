import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types";
import subscriebeStyles from './styles/subscriebe.scss'

const Subscriebe: QuartzComponent = ({} : QuartzComponentProps) => {
    return (
        <div class="email-subscribe-container">
            <h3>Get notified when new stuff drops.</h3>
            <form class="input-container">
                <input type="email" placeholder="Your email" class="email-input" required />
                <button class="subscribe-btn" type='submit'><span>Subscribe</span> <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
            </form>
        </div>
    )
}

Subscriebe.css = subscriebeStyles;

export default (() => Subscriebe) satisfies QuartzComponentConstructor