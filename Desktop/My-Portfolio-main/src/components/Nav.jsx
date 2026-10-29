import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { handleAnchorClick, lockScroll, unlockScroll, scrollToTarget } from '../lib/scroll'
import { useChapter } from '../lib/stage'
import { chapters } from '../data/chapters'
import { navLinks, person, socials } from '../data/content'
import Asterisk from './Asterisk'
import LocalTime from './LocalTime'
import Roll from './Roll'

// Which nav item a chapter belongs to (the three projects all count as "Work").
const NAV_FOR = { about: 0, docmind: 1, codearena: 1, anchor: 1, journey: 2, contact: 3 }

export default function Nav({ ready }) {
  const headerRef = useRef(null)
  const menuRef = useRef(null)
  const burgerRef = useRef(null)
  const menuTl = useRef(null)
  const [open, setOpen] = useState(false)
  const active = NAV_FOR[chapters[useChapter()].id] ?? -1

  useGSAP(
    () => {
      const items = gsap.utils.toArray('[data-nav-item]', headerRef.current)
      if (!ready) {
        gsap.set(items, { autoAlpha: 0, yPercent: -60 })
        return
      }
      gsap.to(items, { autoAlpha: 1, yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 1.2 })
    },
    { scope: headerRef, dependencies: [ready] },
  )

  // Hide on the way down, return on the way up; add a backing once scrolled.
  useGSAP(
    () => {
      const header = headerRef.current
      let hidden = false
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll()
          header.dataset.scrolled = y > 30 ? 'true' : 'false'
          const hide = self.direction === 1 && y > window.innerHeight * 0.5
          if (hide === hidden) return
          hidden = hide
          gsap.to(header, { yPercent: hide ? -100 : 0, duration: 0.7, ease: 'expo.out', overwrite: true })
        },
      })

      return () => st.kill()
    },
    { scope: headerRef },
  )

  useGSAP(
    () => {
      const menu = menuRef.current
      const q = gsap.utils.selector(menu)
      gsap.set(menu, { autoAlpha: 0 })
      menuTl.current = gsap
        .timeline({ paused: true })
        .set(menu, { autoAlpha: 1 })
        .fromTo(
          menu,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: prefersReducedMotion() ? 0.01 : 0.8, ease: 'expo.inOut' },
        )
        .from(q('[data-menu-link]'), { yPercent: 105, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, '-=0.35')
        .from(q('[data-menu-fade]'), { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.04 }, '-=0.6')
    },
    { scope: menuRef },
  )

  useEffect(() => {
    const tl = menuTl.current
    if (!tl) return
    if (open) {
      lockScroll()
      gsap.to(headerRef.current, { yPercent: 0, duration: 0.4, ease: 'expo.out', overwrite: true })
      tl.timeScale(1).play()
      menuRef.current?.querySelector('a')?.focus({ preventScroll: true })
    } else if (tl.progress() > 0) {
      tl.timeScale(1.7).reverse()
      unlockScroll()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        burgerRef.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 768px)')
    const onChange = () => desktop.matches && setOpen(false)
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onChange)
    return () => {
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onChange)
    }
  }, [open])

  const go = (e, href) => {
    if (!open) {
      handleAnchorClick(e, href)
      return
    }
    e.preventDefault()
    setOpen(false)
    setTimeout(() => scrollToTarget(href), 380)
  }

  return (
    <>
      <header ref={headerRef} data-scrolled="false" data-open={open} className="site-header">
        <div className="wrap grid h-16 grid-cols-[1fr_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <a
            href="#home"
            data-nav-item
            onClick={(e) => go(e, '#home')}
            className="group flex items-center gap-2.5 justify-self-start"
            aria-label={`${person.name} — back to top`}
          >
            <span className="block size-4 text-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-180">
              <Asterisk className="size-full" />
            </span>
            <span className="whitespace-nowrap text-[0.95rem] font-extrabold uppercase tracking-[-0.01em] [font-stretch:115%]">
              <Roll>{person.name}</Roll>
            </span>
          </a>

          <p data-nav-item className="mono hidden items-center gap-3 text-dim lg:flex">
            <span>Software Engineer</span>
            <span className="text-accent">/</span>
            <span>
              Karachi <LocalTime className="text-fg" />
            </span>
          </p>

          <div data-nav-item className="flex items-center justify-self-end gap-6">
            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-5">
                {navLinks.map((link, i) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => go(e, link.href)}
                      aria-current={active === i ? 'true' : undefined}
                      className="group relative flex items-start gap-1 text-[0.9rem] font-medium"
                    >
                      <span
                        className={`absolute -left-3 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent transition-transform duration-500 ease-[var(--ease-expo)] ${active === i ? 'scale-100' : 'scale-0'}`}
                      />
                      <Roll>{link.label}</Roll>
                      <sup className="mono text-[0.55rem] text-dim">0{i + 1}</sup>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <a
              href={person.resume}
              download="Taha-Naqvi-Resume.pdf"
              className="ulink is-underlined hidden text-[0.9rem] font-medium min-[400px]:inline-flex"
            >
              Résumé
              <span className="arr arr-down" aria-hidden="true">
                ↓
              </span>
            </a>
            <button
              ref={burgerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="mono relative z-[60] flex items-center gap-2 md:hidden"
            >
              <span className="relative block h-2.5 w-5">
                <span
                  className={`absolute left-0 h-px w-full bg-current transition-all duration-500 ease-[var(--ease-expo)] ${open ? 'top-1 rotate-45' : 'top-0'}`}
                />
                <span
                  className={`absolute left-0 h-px w-full bg-current transition-all duration-500 ease-[var(--ease-expo)] ${open ? 'top-1 -rotate-45' : 'top-2.5'}`}
                />
              </span>
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className="invisible fixed inset-0 z-[45] flex flex-col bg-bg px-[var(--pad)] pb-8 pt-24 text-fg md:hidden"
      >
        <p data-menu-fade className="mono mb-6 text-dim">
          Index
        </p>
        <ul className="flex flex-col">
          {[{ label: 'Home', href: '#home' }, ...navLinks].map((link, i) => (
            <li key={link.href} className="overflow-hidden border-b border-line">
              <a
                data-menu-link
                href={link.href}
                onClick={(e) => go(e, link.href)}
                className="flex items-baseline justify-between py-2.5"
              >
                <span className="stretch text-[clamp(2.3rem,11vw,3.4rem)] uppercase leading-none">{link.label}</span>
                <span className="mono text-dim">0{i}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-4">
          <div data-menu-fade className="flex flex-wrap gap-x-6 gap-y-2 text-lg">
            <a href={person.resume} download="Taha-Naqvi-Resume.pdf" className="ulink is-underlined">
              Résumé
              <span className="arr arr-down" aria-hidden="true">
                ↓
              </span>
            </a>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="ulink is-underlined">
                {s.label}
                <span className="arr arr-ne" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
          <p data-menu-fade className="mono text-dim">
            {person.coordinates} — Karachi, PK
          </p>
        </div>
      </div>
    </>
  )
}
