import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"
import { Darkmode } from "../components"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = (componentData: QuartzComponentProps) => {
    const { displayClass, cfg } = componentData;
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    const DarkModeComponent = Darkmode();
    return (
      <footer class={`${displayClass ?? ""} footer`}>
        <div class="links">
          <p>
            <a href="https://forgottenpillar.com" target='_blank'>The Forgotten Pillar Project</a>{" | "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target='_blank'>CC BY 4.0</a>
          </p>
          <ul class='footer-link'>
            {Object.entries(links).map(([text, link]) => (
              <li>
                <a href={link} target='_blank'>{text}</a>
              </li>
            ))}
          </ul>
        </div>
        <div class="darkmode-toggle">
            <DarkModeComponent {...componentData} />
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
