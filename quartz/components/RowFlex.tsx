import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from './styles/rowFlex.scss'

export default ((components?: QuartzComponent[]) => {
  if (components) {

    const RowFlex: QuartzComponent = (props: QuartzComponentProps) => {
      return (<div class="row-flex">
        {components.map(component => {
          const Component = component;
          return <Component {...props} />
        })}
      </div>)
    }

    const afterDOMLoaded = components.map(component => component.afterDOMLoaded).join('\n\n')
    const beforeDOMLoaded = components.map(component => component.beforeDOMLoaded).join('\n\n')
    const css = components.map(component => component.css).join('\n\n')

    RowFlex.displayName = 'RowFlex'
    RowFlex.afterDOMLoaded = afterDOMLoaded
    RowFlex.beforeDOMLoaded = beforeDOMLoaded
    RowFlex.css = css + '\n\n' + styles
    return RowFlex
  } else {
    return () => <></>
  }
}) satisfies QuartzComponentConstructor
