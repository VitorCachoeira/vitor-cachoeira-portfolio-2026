export type VideoPlatform = 'youtube' | 'vimeo'

export type VideoRole = 'DIRECTOR' | 'CINEMATOGRAPHER' | 'EDITOR' | 'COLORIST' | 'SOUNDTRACK'

export type VideoMeta = {
  id: string
  title: string
  platform: VideoPlatform
  videoId: string
  year: string
  roles: VideoRole[]
  embedUrl: string
  thumbnailUrl?: string // Optional custom thumbnail URL
}

// Lista vazia por padrão — o conteúdo real é gerenciado pelo painel /admin
// e armazenado no banco (Neon). O cache local (localStorage) é usado para
// exibição imediata entre sessões. Não edite este array manualmente.
export const videos: VideoMeta[] = []
