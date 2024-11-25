import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default ((component?: QuartzComponent) => {
  if (component) {
    const Component = component
    const DesktoFullOnly: QuartzComponent = (props: QuartzComponentProps) => {
      return <Component displayClass="desktop-full-only" {...props} />
    }

    DesktoFullOnly.displayName = component.displayName
    DesktoFullOnly.afterDOMLoaded = component?.afterDOMLoaded
    DesktoFullOnly.beforeDOMLoaded = component?.beforeDOMLoaded
    DesktoFullOnly.css = component?.css
    return DesktoFullOnly
  } else {
    return () => <></>
  }
}) satisfies QuartzComponentConstructor
