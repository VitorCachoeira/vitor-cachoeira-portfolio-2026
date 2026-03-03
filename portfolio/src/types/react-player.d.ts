declare module 'react-player' {
  import { ComponentType } from 'react'

  export interface ReactPlayerProps {
    url: string | string[]
    playing?: boolean
    controls?: boolean
    width?: string | number
    height?: string | number
    loop?: boolean
    muted?: boolean
    volume?: number
    onReady?: () => void
    onStart?: () => void
    onPlay?: () => void
    onPause?: () => void
    onEnded?: () => void
    onError?: (error: Error) => void
  }

  const ReactPlayer: ComponentType<ReactPlayerProps>
  export default ReactPlayer
  export type { ReactPlayerProps }
}

export {}
