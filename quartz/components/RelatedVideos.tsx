import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"


function RecentVideos({ displayClass, fileData }: QuartzComponentProps) {
    
    const urls = fileData.frontmatter?.fpRelatedVideos as string[]

    if(!urls || urls.length === 0) {
        return null;
    }

    function extractYouTubeIDs(url: string) {
        let id = '';
    
        if (url.includes('youtu.be/')) {
          id = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch?v=')) {
          id = new URL(url).searchParams.get('v') as string;
        }
    
        return id;
    }
    
    const videoThumbnails = urls.map(url => {
        const videoId = extractYouTubeIDs(url)
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    })
    
    
  
  return <div class={classNames(displayClass, "related-videos")}>
        <h3>Related Video{videoThumbnails.length > 1 ? 's' : ''}</h3>
        <div class='list'>
            {videoThumbnails.map((thumbnail, index) => (
                <a href={urls.at(index)} aria-label={`related video ${index + 1}`} target='_blank'>
                    <img src={thumbnail} alt={`video thumbnail ${index + 1}`} /></a>
            ))}
        </div>
    </div>
}

export default (() => RecentVideos) satisfies QuartzComponentConstructor
