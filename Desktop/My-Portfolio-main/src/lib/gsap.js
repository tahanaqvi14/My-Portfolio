import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// Every visit starts at the top (see main.jsx). ScrollTrigger re-applies the scroll
// restoration mode it saw at start-up on each refresh, so hand it 'manual' explicitly.
ScrollTrigger.clearScrollMemory('manual')

gsap.defaults({ ease: 'power3.out', duration: 0.8 })

// Mobile browsers resize the viewport when the address bar shows/hides;
// refreshing on every one of those makes pinned sections jump.
ScrollTrigger.config({ ignoreMobileResize: true })

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export { gsap, ScrollTrigger, SplitText, useGSAP }
