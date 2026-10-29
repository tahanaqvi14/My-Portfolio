import { chapters } from '../data/chapters'
import { person, projects, socials } from '../data/content'
import { useChapter } from '../lib/stage'
import { handleAnchorClick, scrollToTarget } from '../lib/scroll'

const ext = { target: '_blank', rel: 'noopener noreferrer' }

// Fixed bar along the bottom: where you are, and what you can do at this stop.
export default function Hud({ ready }) {
  const index = useChapter()
  const chapter = chapters[index]
  const project = projects.find((p) => p.id === chapter.id)
  const isFin = chapter.id === 'fin'

  return (
    <div className="hud" data-ready={ready}>
      <p className="hud-where mono" aria-live="polite">
        <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
        <span className="text-dim">&nbsp;/&nbsp;{String(chapters.length).padStart(2, '0')}</span>
        <span key={chapter.id} className="hud-title">
          {chapter.title}
        </span>
      </p>

      <div key={chapter.id} className="hud-actions">
        {index === 0 && (
          <a href="#intent" onClick={(e) => handleAnchorClick(e, '#intent')} className="hud-scroll mono">
            Scroll to explore
            <span className="hud-scroll-line" aria-hidden="true" />
          </a>
        )}
        {project && (
          <>
            <a href={project.links.demo} {...ext} className="hud-btn" aria-label={`${project.title} live demo (opens in a new tab)`}>
              Live demo <span aria-hidden="true">↗</span>
            </a>
            <a href={project.links.code} {...ext} className="hud-link" aria-label={`${project.title} source code (opens in a new tab)`}>
              Source <span aria-hidden="true">↗</span>
            </a>
          </>
        )}
        {isFin && (
          <>
            {socials.map((s) => (
              <a key={s.label} href={s.href} {...ext} className="hud-link">
                {s.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
            <a href={person.resume} download="Taha-Naqvi-Resume.pdf" className="hud-link">
              Résumé <span aria-hidden="true">↓</span>
            </a>
            <button type="button" onClick={() => scrollToTarget(0)} className="hud-btn">
              Back to top <span aria-hidden="true">↑</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
