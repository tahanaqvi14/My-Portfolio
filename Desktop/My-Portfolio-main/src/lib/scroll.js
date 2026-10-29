import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis = null

export function initSmoothScroll() {
  if (lenis) return () => {}

  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: !prefersReducedMotion(),
    autoRaf: false,
  })

  const offScroll = lenis.on('scroll', ScrollTrigger.update)
  const tick = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    offScroll()
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export const getLenis = () => lenis

export function lockScroll() {
  lenis?.stop()
  document.documentElement.classList.add('is-locked')
}

export function unlockScroll() {
  document.documentElement.classList.remove('is-locked')
  lenis?.start()
}

export function scrollToTarget(target, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (el == null && typeof target !== 'number') return

  if (lenis) {
    lenis.scrollTo(el ?? target, {
      duration: prefersReducedMotion() ? 0 : 1.6,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      ...options,
    })
  } else if (el) {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
}

// Turns a regular in-page anchor click into a smooth Lenis scroll.
export function handleAnchorClick(event, href, onDone) {
  if (!href?.startsWith('#')) return
  const el = document.querySelector(href)
  if (!el) return
  event.preventDefault()
  scrollToTarget(el)
  onDone?.()
}
