import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>,
  components?: QuartzComponent[]
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = (componentData: QuartzComponentProps) => {
    const { displayClass, cfg } = componentData;
    const year = new Date().getFullYear()
    const links = opts?.links ?? []

    return (
      <footer class={`${displayClass ?? ""} footer no-print`}>
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
        <div class="footer-components">
          {opts?.components && opts?.components.map((FooterComponent) => <FooterComponent {...componentData} />)}
        </div>
      </footer>
    )
  }

  // there is a bug somewhere so I am not using this
  // const beforeDOMLoaded = opts?.components ? opts.components.map(component => component.beforeDOMLoaded).join('\n\n') : ''
  // const afterDOMLoaded = opts?.components ? opts.components.map(component => component.afterDOMLoaded).join('\n\n') : ''
  // const componentStyles = opts?.components ? opts.components.map(component => component.css).join('\n\n') : ''

  Footer.css = style
  // Footer.css = style + '\n\n' + componentStyles
  // Footer.beforeDOMLoaded = beforeDOMLoaded
  // Footer.afterDOMLoaded = afterDOMLoaded
  return Footer
}) satisfies QuartzComponentConstructor
