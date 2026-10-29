import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'

const MIN_MS = 1300

// Opening screen: follows the real loading progress of the 3D world, then lifts away
// as the name assembles.
export default function Loader({ ready, progress, onDone }) {
  const [gone, setGone] = useState(false)
  const rootRef = useRef(null)
  const numRef = useRef(null)
  const count = useRef({ value: 0 })
  const shownAt = useRef(0)

  const render = () => {
    if (numRef.current) numRef.current.textContent = String(Math.round(count.current.value)).padStart(3, '0')
  }

  useGSAP(
    () => {
      shownAt.current = performance.now()
      if (!prefersReducedMotion()) gsap.from('[data-loader-in]', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.07 })
    },
    { scope: rootRef },
  )

  // Count towards the real progress (never quite to 100 until everything is ready).
  useEffect(() => {
    if (ready) return
    const tween = gsap.to(count.current, {
      value: Math.max(6, progress * 96),
      duration: 0.7,
      ease: 'power2.out',
      onUpdate: render,
      overwrite: true,
    })
    return () => tween.kill()
  }, [progress, ready])

  useEffect(() => {
    if (!ready) return
    const root = rootRef.current
    const reduced = prefersReducedMotion()
    let tl
    const finish = () => {
      tl = gsap
        .timeline()
        .to(count.current, { value: 100, duration: reduced ? 0.1 : 0.45, ease: 'power2.inOut', onUpdate: render, overwrite: true })
        .to(root.querySelectorAll('[data-loader-in]'), {
          yPercent: -110,
          duration: reduced ? 0.01 : 0.7,
          ease: 'expo.in',
          stagger: 0.05,
        })
        .add(() => onDone())
        .to(root, { autoAlpha: 0, duration: reduced ? 0.2 : 1, ease: 'power2.out', onComplete: () => setGone(true) })
    }
    const wait = Math.max(0, MIN_MS - (performance.now() - shownAt.current))
    const id = setTimeout(finish, wait)
    return () => {
      clearTimeout(id)
      tl?.kill()
    }
  }, [ready, onDone])

  if (gone) return null

  return (
    <div ref={rootRef} className="loader" aria-hidden="true">
      <div className="wrap loader-inner">
        <div className="overflow-hidden">
          <p data-loader-in className="mono text-dim">
            Taha Naqvi — Portfolio
          </p>
        </div>
        <div className="overflow-hidden">
          <p data-loader-in className="loader-count">
            <span ref={numRef}>000</span>
          </p>
        </div>
        <div className="overflow-hidden">
          <p data-loader-in className="mono text-dim">
            Building the world
          </p>
        </div>
      </div>
    </div>
  )
}
