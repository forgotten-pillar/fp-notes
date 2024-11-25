import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Subscriebe(),
    // Component.Comments({
    //   provider: 'giscus',
    //   options: {
    //     // from data-repo
    //     repo: 'mpresecan/fp-notes',
    //     // from data-repo-id
    //     repoId: 'R_kgDONObySw',
    //     // from data-category
    //     category: 'Announcements',
    //     // from data-category-id
    //     categoryId: 'DIC_kwDONObyS84CkNz5',
    //     inputPosition: 'top',
    //   }
    // }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/mpresecan/fp-notes",
      "Download Center": "https://forgottenpillar.com/books",
      Contribute: "/contribute",
      RSS: "/index.xml",
    },
    components: [Component.TranslateButton(), Component.PrintButton(), Component.GraphMini(), Component.Darkmode()]
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.PrintMeta(),
    Component.TagList(),
    // Component.MobileOnly(Component.ShareButtons()),
    Component.TTS(),
  ],
  left: [
    Component.PageTitle(),
    Component.Search(),
    // Component.ReadingModeToggle(),
    Component.MobileOnly(Component.HamburgerMenu()),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.ShareButtons(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.RelatedVideos(),
    Component.RelatedRead(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.Search(),
    Component.MobileOnly(Component.HamburgerMenu()),
    Component.DesktopOnly(Component.Explorer()),
    // Component.Darkmode(),
    // Component.GraphMini()
  ],
  right: [],
}
