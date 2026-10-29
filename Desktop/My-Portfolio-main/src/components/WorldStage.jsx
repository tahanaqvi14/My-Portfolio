import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/gsap'
import { stage } from '../lib/stage'
import { hasWebGL2, loadWorld } from '../lib/webgl'
import { chapters } from '../data/chapters'

// Mounts the 3D world behind the page. The page's sections are only scroll length;
// the world sizes them and flies the camera as you scroll through them.
export default function WorldStage({ onReady, onProgress, started }) {
  const hostRef = useRef(null)
  const startedRef = useRef(started)

  useEffect(() => {
    startedRef.current = started
    if (started) stage.world?.playIntro()
  }, [started])

  useEffect(() => {
    const host = hostRef.current
    const html = document.documentElement
    const sections = chapters.map((c) => document.getElementById(c.id)).filter(Boolean)
    let alive = true
    let world = null
    let sent = false
    const ready = () => {
      if (sent || !alive) return
      sent = true
      onReady()
    }

    const canvas = document.createElement('canvas')
    canvas.className = 'stage-canvas'
    host.prepend(canvas)

    const fallback = () => {
      sections.forEach((el) => (el.style.height = ''))
      stage.setMode('fallback')
      html.classList.add('no-webgl')
      canvas.remove()
      ready()
    }
    // Never hold the page hostage to a slow device or download.
    const timer = setTimeout(ready, 12000)

    const start = async () => {
      const { World } = await loadWorld()
      if (!alive) return
      try {
        world = new World(canvas, {
          reduced: prefersReducedMotion(),
          onStation: (i) => stage.setChapter(i),
          onCursor: (state) => window.dispatchEvent(new CustomEvent('world:cursor', { detail: state })),
        })
      } catch (error) {
        console.warn('WebGL is unavailable, showing the plain page.', error)
        world = null
        fallback()
        return
      }
      await world.init(sections, (p) => alive && onProgress(p))
      if (!alive || world.disposed) return
      stage.world = world
      stage.setMode('webgl')
      if (import.meta.env.DEV) window.__world = world
      html.classList.add('has-webgl')
      if (startedRef.current) world.playIntro()
      ready()
    }

    if (!hasWebGL2) {
      fallback()
    } else {
      start().catch((error) => {
        if (!alive) return
        console.warn('The 3D scene failed to start; showing the plain page.', error)
        world?.dispose()
        world = null
        fallback()
      })
    }

    return () => {
      alive = false
      clearTimeout(timer)
      world?.dispose()
      world = null
      stage.world = null
      stage.setMode('loading')
      canvas.remove()
      sections.forEach((el) => (el.style.height = ''))
      html.classList.remove('has-webgl', 'no-webgl')
    }
  }, [onReady, onProgress])

  return (
    <div ref={hostRef} className="stage" aria-hidden="true">
      <div className="stage-vignette" />
    </div>
  )
}
