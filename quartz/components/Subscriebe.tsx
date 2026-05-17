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
      <button
        type="button"
        class="push-bell-btn"
        data-state="idle"
        aria-label="Enable browser notifications"
        title="Enable browser notifications"
      >
        <span class="push-bell-icon icon-default" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M15 8h6" />
            <path d="M18 5v6" />
            <path d="M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332" />
          </svg>
        </span>
        <span class="push-bell-icon icon-hover" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M15 8h6" />
            <path d="M18 5v6" />
            <path d="M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332" />
          </svg>
        </span>
      </button>
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
      <p class="push-bell-message"></p>
      <p class="push-ios-hint" style="display:none">
        To enable, tap Share → Add to Home Screen, then open from the home screen and try again.
      </p>
    </div>
  )
}

Subscriebe.css = subscriebeStyles
Subscriebe.afterDOMLoaded = script

export default (() => Subscriebe) satisfies QuartzComponentConstructor
