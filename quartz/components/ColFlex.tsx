import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from './styles/colFlex.scss'

export default ((components?: QuartzComponent[]) => {
  if (components) {

    const ColFlex: QuartzComponent = (props: QuartzComponentProps) => {
      return (<div class="col-flex">
        {components.map(component => {
          const Component = component;
          return <Component {...props} />
        })}
      </div>)
    }

    const afterDOMLoaded = components.map(component => component.afterDOMLoaded).join('\n\n')
    const beforeDOMLoaded = components.map(component => component.beforeDOMLoaded).join('\n\n')
    const css = components.map(component => component.css).join('\n\n')

    ColFlex.displayName = 'ColFlex'
    ColFlex.afterDOMLoaded = afterDOMLoaded
    ColFlex.beforeDOMLoaded = beforeDOMLoaded
    ColFlex.css = css + '\n\n' + styles
    return ColFlex
  } else {
    return () => <></>
  }
}) satisfies QuartzComponentConstructor
