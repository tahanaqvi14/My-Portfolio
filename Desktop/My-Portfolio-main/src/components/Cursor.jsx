import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useMediaQuery } from '../lib/useMediaQuery'

const INTERACTIVE = 'a, button, [role="button"], label, summary'

export default function Cursor() {
  const enabled = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const rootRef = useRef(null)
  const posRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!enabled || reduced) return
    const root = rootRef.current
    const html = document.documentElement
    html.classList.add('has-cursor')

    const xTo = gsap.quickTo(posRef.current, 'x', { duration: 0.18, ease: 'power3' })
    const yTo = gsap.quickTo(posRef.current, 'y', { duration: 0.18, ease: 'power3' })

    let first = true
    const onMove = (e) => {
      if (first) {
        gsap.set(posRef.current, { x: e.clientX, y: e.clientY })
        first = false
      }
      xTo(e.clientX)
      yTo(e.clientY)
      root.classList.add('is-visible')
    }

    const onOver = (e) => {
      const el = e.target instanceof Element ? e.target : null
      if (!el) return
      if (el.closest('input, textarea, select')) {
        root.dataset.state = 'text'
        return
      }
      const labelled = el.closest('[data-cursor-label]')
      if (labelled) {
        labelRef.current.textContent = labelled.dataset.cursorLabel
        root.dataset.state = 'label'
        return
      }
      root.dataset.state = el.closest(INTERACTIVE) ? 'link' : ''
    }
    const onDown = () => root.classList.add('is-pressed')
    const onUp = () => root.classList.remove('is-pressed')
    const onOut = (e) => {
      if (!e.relatedTarget) root.classList.remove('is-visible')
    }
    // Hovering 3D objects (keys, screens) reported by the world.
    const onWorld = (e) => {
      if (e.detail === 'open') {
        labelRef.current.textContent = 'Open'
        root.dataset.state = 'label'
      } else root.dataset.state = e.detail ? 'link' : ''
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('world:cursor', onWorld)

    return () => {
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('world:cursor', onWorld)
    }
  }, [enabled, reduced])

  if (!enabled || reduced) return null

  return (
    <div ref={rootRef} className="cursor" aria-hidden="true">
      <div ref={posRef} className="cursor-pos">
        <div className="cursor-dot">
          <span ref={labelRef} className="cursor-label" />
        </div>
      </div>
    </div>
  )
}
