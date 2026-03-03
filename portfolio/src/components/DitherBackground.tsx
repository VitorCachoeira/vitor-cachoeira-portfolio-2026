import { useEffect, useRef } from 'react'

export function DitherBackground() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    let isIframeReady = false
    let rafId: number | null = null
    let pendingEvent: MouseEvent | null = null

    const handleIframeLoad = () => {
      console.log('[DitherBackground] Iframe loaded, waiting for init...')
      // Wait for the iframe's init() to complete
      setTimeout(() => {
        isIframeReady = true
        console.log('[DitherBackground] Iframe ready, mouse events enabled')
        // Send any pending event
        if (pendingEvent) {
          handleMouseMove(pendingEvent)
          pendingEvent = null
        }
      }, 500)
    }

    const sendMouseEvent = (e: MouseEvent) => {
      const iframe = iframeRef.current
      if (!iframe?.contentWindow) {
        console.warn('[DitherBackground] Iframe or contentWindow not available')
        return false
      }

      try {
        const message = {
          type: 'mousemove',
          clientX: e.clientX,
          clientY: e.clientY,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        }
        iframe.contentWindow.postMessage(message, '*')
        return true
      } catch (error) {
        console.error('[DitherBackground] Error posting message:', error)
        return false
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isIframeReady) {
        pendingEvent = e
        return
      }

      // Use requestAnimationFrame to throttle updates
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        sendMouseEvent(e)
        rafId = null
      })
    }

    const iframe = iframeRef.current
    if (iframe) {
      // Check if already loaded first
      if (iframe.contentDocument?.readyState === 'complete') {
        console.log('[DitherBackground] Iframe already loaded')
        handleIframeLoad()
      } else {
        iframe.addEventListener('load', handleIframeLoad, { once: true })
      }
    } else {
      console.warn('[DitherBackground] Iframe ref not available')
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    console.log('[DitherBackground] Mouse event listener added to window')
    
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad)
      }
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <iframe
      ref={iframeRef}
      src="/fonts/arquivos_site_cachoeira/dither_v2.html"
      className="dither-background"
      title="Dither Background Animation"
      scrolling="no"
      frameBorder="0"
      style={{
        border: 'none',
        display: 'block',
      }}
    />
  )
}

