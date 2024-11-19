import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"


function PrintMeta({ displayClass, fileData }: QuartzComponentProps) {
    const path = fileData.frontmatter?.permalink ? fileData.frontmatter.permalink : fileData.slug !== 'index' ? fileData.slug : '';
    const link = `https://notefp.link/${path}`;
  
  return <p class={classNames(displayClass, "content-meta print-meta print-only")}>
        Article source: {link}
    </p>
}

export default (() => PrintMeta) satisfies QuartzComponentConstructor
