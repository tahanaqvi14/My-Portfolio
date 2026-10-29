import { useEffect, useRef } from 'react'
import { gsap, isFinePointer, prefersReducedMotion } from '../lib/gsap'

// Pulls its child toward the pointer while hovered, then springs back.
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !isFinePointer() || prefersReducedMotion()) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.45)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.45)' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      // Measure from the resting centre, not the already-shifted one.
      const cx = rect.left + rect.width / 2 - gsap.getProperty(el, 'x')
      const cy = rect.top + rect.height / 2 - gsap.getProperty(el, 'y')
      xTo((e.clientX - cx) * strength)
      yTo((e.clientY - cy) * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(el)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [strength])

  return (
    <span ref={ref} className={`inline-flex ${className}`}>
      {children}
    </span>
  )
}
