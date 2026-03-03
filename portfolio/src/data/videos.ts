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

export const videos: VideoMeta[] = [
  {
    id: 'laroye',
    title: 'LAROYÊ',
    platform: 'youtube',
    videoId: 'eEfurQ9uYYE', // YouTube title: "LAROYÊ, 2021"
    year: '2021',
    roles: ['DIRECTOR', 'EDITOR', 'COLORIST', 'SOUNDTRACK'], // Matches: DIRECTOR, EDITOR, COLORIST, SOUNDTRACK
    embedUrl: 'https://www.youtube.com/embed/eEfurQ9uYYE?rel=0&modestbranding=1&playsinline=1',
  },
  {
    id: 'thalassa',
    title: 'THALASSA',
    platform: 'youtube',
    videoId: '8REf7Q46Izc', // YouTube title: "THALASSA - FASHION FILM"
    year: '2022',
    roles: ['DIRECTOR', 'CINEMATOGRAPHER', 'EDITOR', 'COLORIST'], // Matches: DIRECTOR, CINEMATOGRAPHER, EDITOR, COLORIST
    embedUrl: 'https://www.youtube.com/embed/8REf7Q46Izc?rel=0&modestbranding=1&playsinline=1',
  },
  {
    id: 'vereda',
    title: 'VEREDA',
    platform: 'youtube',
    videoId: 'ScTLp-7Nak8', // YouTube title: "VEREDA - SHORT FILM"
    year: '2023',
    roles: ['DIRECTOR', 'CINEMATOGRAPHER', 'EDITOR', 'COLORIST'], // Matches: DIRECTOR, CINEMATOGRAPHER, EDITOR, COLORIST
    embedUrl: 'https://www.youtube.com/embed/ScTLp-7Nak8?rel=0&modestbranding=1&playsinline=1',
  },
  {
    id: 'kabeca-cheia-sentimentos-selvagens',
    title: 'KABEÇA CHEIA SENTIMENTOS SELVAGENS',
    platform: 'youtube',
    videoId: 'wi5Mmo_89fE', // YouTube title: "Kabeça Cheia - Pensadimais (Clipe Oficial)"
    year: '2024',
    roles: ['CINEMATOGRAPHER', 'EDITOR', 'COLORIST'], // Matches: CINEMATOGRAPHER, EDITOR, COLORIST
    embedUrl: 'https://www.youtube.com/embed/wi5Mmo_89fE?rel=0&modestbranding=1&playsinline=1',
  },
]
