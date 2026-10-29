import { chapters } from '../data/chapters'
import { useChapter } from '../lib/stage'
import { handleAnchorClick } from '../lib/scroll'

// Chapter index on the right edge of wide screens; follows the particle scene.
export default function Rail({ ready }) {
  const current = useChapter()

  return (
    <nav aria-label="Chapters" className="rail" data-ready={ready}>
      <ol>
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              onClick={(e) => handleAnchorClick(e, `#${c.id}`)}
              aria-current={current === i ? 'step' : undefined}
            >
              <span className="rail-label">{c.title}</span>
              <span className="rail-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="rail-tick" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
