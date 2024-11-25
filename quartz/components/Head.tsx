import { i18n } from "../i18n"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const Head: QuartzComponent = ({ cfg, fileData, externalResources }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description
    const { css, js } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "notes.forgottenpillar.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)

    const iconPath = 'https://forgotten-pillar.s3.us-east-2.amazonaws.com/fp-notes-logo.svg'
    const pathForUrl = fileData.frontmatter?.permalink ? fileData.frontmatter.permalink : fileData.slug !== 'index' ? fileData.slug : '';
    const link = `https://notefp.link/${pathForUrl}`;
    const ogImagePath = fileData?.frontmatter?.title ? `https://forgottenpillar.com/api/og-notes?title=${encodeURIComponent(fileData.frontmatter?.title)}` : 'https://forgotten-pillar.s3.us-east-2.amazonaws.com/og-notes.png'

    // Prepare JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": fileData.frontmatter?.title || 'The Forgotten Pillar Notes',
      "description": fileData.frontmatter?.description || description,
      "image": ogImagePath,
      "author": {
        "@type": "Organization",
        "name": "The Forgotten Pillar"
      },
      "publisher": {
        "@type": "Organization",
        "name": "The Forgotten Pillar",
        "logo": {
          "@type": "ImageObject",
          "url": "https://forgotten-pillar.s3.us-east-2.amazonaws.com/fp-notes-logo.svg"
        }
      },
      "datePublished": fileData.dates?.created || new Date().toISOString(),
      "dateModified": fileData.dates?.modified || new Date().toISOString(),
      "mainEntityOfPage": `https://${cfg.baseUrl!}/${fileData.slug!}`
    }

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            <link rel="stylesheet" href='https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400;700' />
          </>
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {cfg.baseUrl && <meta property="og:image" content={ogImagePath} />}
        <meta property="og:width" content="1200" />
        <meta property="og:height" content="675" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={link} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImagePath}></meta>
        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />
        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        
        {/* JSON-LD script - output raw JSON */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <meta name="google-site-verification" content="VNplcD2JGpi5cKkzCp2MY7RJ7klWEfrcUo8KwcSyIO8" />
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor