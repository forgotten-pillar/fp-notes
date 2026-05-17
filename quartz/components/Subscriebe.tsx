import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import subscriebeStyles from "./styles/subscriebe.scss"
// @ts-ignore
import script from "./scripts/subscriebe.inline"

const Subscriebe: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const push = cfg.pushNotifications
  return (
    <div
      class="email-subscribe-container"
      data-push-vapid-key={push?.vapidPublicKey ?? ""}
      data-push-subscribe-url={push?.subscribeUrl ?? ""}
      data-push-unsubscribe-url={push?.unsubscribeUrl ?? ""}
    >
      <h3>Get notified when new stuff drops.</h3>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="subscribe-bell-icon"
        aria-hidden="true"
      >
        <path d="M10.268 21a2 2 0 0 0 3.464 0" />
        <path d="M22 8c0-2.3-.8-4.3-2-6" />
        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        <path d="M4 2C2.8 3.7 2 5.7 2 8" />
      </svg>
      <p class="notice">
        Get notified via email, or by{" "}
        <a
          href="https://t.me/forgottenpillar"
          target="_blank"
          aria-label="link to telegram channel"
          title="Subscriebe to Telegram Channel"
          class="telegram-channel"
        >
          <span>Telegram Channel</span>{" "}
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 448 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z"></path>
          </svg>
        </a>
      </p>
      <form class="input-container">
        <input type="email" placeholder="Your email" class="email-input" required />
        <button class="subscribe-btn" type="submit">
          <span>Subscribe</span>{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-arrow-right"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>
      <p class="subscribe-message"></p>
      <div class="push-subscribe-block">
        <h4>Get instant alerts in your browser</h4>
        <button class="push-subscribe-btn" type="button">
          <span class="push-subscribe-btn-label">🔔 Enable browser notifications</span>
        </button>
        <p class="push-subscribe-message"></p>
        <p class="push-ios-hint" style="display:none">
          📱 To enable, tap Share → Add to Home Screen, then open from the home screen and try
          again.
        </p>
      </div>
    </div>
  )
}

Subscriebe.css = subscriebeStyles
Subscriebe.afterDOMLoaded = script

export default (() => Subscriebe) satisfies QuartzComponentConstructor
