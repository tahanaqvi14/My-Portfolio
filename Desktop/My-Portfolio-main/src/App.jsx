import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { initSmoothScroll, lockScroll, unlockScroll, scrollToTarget } from './lib/scroll'
import WorldStage from './components/WorldStage'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import Rail from './components/Rail'
import Hud from './components/Hud'
import Content from './sections/Content'

// The old site had the projects on /lastpage; send those links to the first project.
function initialTarget() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/lastpage') return '#docmind'
  const hash = window.location.hash
  if (!hash) return null
  try {
    return document.querySelector(hash) ? hash : null
  } catch {
    return null
  }
}

export default function App() {
  const [stageReady, setStageReady] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const destroy = initSmoothScroll()
    lockScroll()

    // Re-measure scroll-linked UI whenever the page's height changes (the 3D world
    // sets each section's scroll length after it has laid out its copy).
    let timer
    const ro = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(() => ScrollTrigger.refresh(), 200)
    })
    ro.observe(document.body)

    return () => {
      clearTimeout(timer)
      ro.disconnect()
      destroy()
      unlockScroll()
    }
  }, [])

  const handleStageReady = useCallback(() => setStageReady(true), [])

  const handleReveal = useCallback(() => {
    setRevealed(true)
    unlockScroll()
    ScrollTrigger.refresh()

    const target = initialTarget()
    if (window.location.pathname !== '/') window.history.replaceState(null, '', `/${target ?? ''}`)
    if (target) setTimeout(() => scrollToTarget(target), 900)
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <WorldStage onReady={handleStageReady} onProgress={setProgress} started={revealed} />
      <Loader ready={stageReady} progress={progress} onDone={handleReveal} />
      <Cursor />
      <ScrollProgress />
      <Nav ready={revealed} />
      <Rail ready={revealed} />
      <Hud ready={revealed} />
      <main id="main" className="relative z-[1]">
        <Content />
      </main>
      <div className="grain" aria-hidden="true" />
    </>
  )
}
