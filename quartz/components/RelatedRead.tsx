import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"


function RelatedRead({ displayClass, fileData }: QuartzComponentProps) {
    
    const urls = fileData.frontmatter?.fpRelatedReads as string[]

    if(!urls || urls.length === 0) {
        return null;
    }

    const allowedReadsMap = new Map([
        ['the-forgotten-pillar', 'https://forgotten-pillar.s3.us-east-2.amazonaws.com/Front-Cover-mocup-h800-483x700-1.webp'],
        ['rediscovering-the-pillar', 'https://forgotten-pillar.s3.us-east-2.amazonaws.com/Rediscovering-the-Pillar-cover-light.png'],
        ['sonship-of-christ-controversy', 'https://forgotten-pillar.s3.us-east-2.amazonaws.com/Cover.png'],
        ['the-way-he-led-us', 'https://forgotten-pillar.s3.us-east-2.amazonaws.com/Cover-1.png']
    ])

    const allowedReads = urls.filter(url => allowedReadsMap.keys().toArray().includes(url));

  return <div class={classNames(displayClass, "related-read")}>
        <h3>Related Read{urls.length > 1 ? 's' : ''}</h3>
        <div class='list'>
            {allowedReads.map((read, index) => (
                <a href={`https://forgottenpillar.com/book/${read}`} aria-label={`related read ${read}`} target='_blank' class='read-target' data-target={read}>
                    <img src={allowedReadsMap.get(read)} alt={`${read} cover`} /></a>
            ))}
        </div>
    </div>
}

export default (() => RelatedRead) satisfies QuartzComponentConstructor
