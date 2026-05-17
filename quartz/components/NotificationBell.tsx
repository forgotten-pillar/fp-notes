import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from "./styles/notificationBell.scss"
import { classNames } from "../util/lang"

const NotificationBell: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  const push = cfg.pushNotifications
  if (!push || !push.subscribeUrl || !push.unsubscribeUrl) {
    return null
  }

  return (
    <button
      type="button"
      class={classNames(displayClass, "notification-bell", "push-bell-btn")}
      data-push-bell
      data-state="idle"
      aria-label="Enable browser notifications"
      title="Enable browser notifications"
    >
      <span class="notification-bell-icon icon-default" aria-hidden="true">
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
      <span class="notification-bell-icon icon-hover" aria-hidden="true">
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
  )
}

NotificationBell.css = styles

export default (() => NotificationBell) satisfies QuartzComponentConstructor
