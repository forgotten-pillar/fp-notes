import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
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
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
