import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { VideoMeta } from '../data/videos.ts'
import { VideoCard } from './VideoCard.tsx'

type VideoGridProps = {
  videos: VideoMeta[]
  onSelectVideo: (id: string) => void
}

export const VideoGrid = ({ videos, onSelectVideo }: VideoGridProps) => {
  const [parent] = useAutoAnimate<HTMLDivElement>({ duration: 320 })

  return (
    <section className="video-grid" ref={parent}>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onSelect={onSelectVideo} />
      ))}
    </section>
  )
}
