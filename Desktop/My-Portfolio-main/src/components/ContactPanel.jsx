import { chapterById } from '../data/chapters'
import { socials } from '../data/content'
import { stage, useChapter } from '../lib/stage'
import ContactForm from './ContactForm'

const ext = { target: '_blank', rel: 'noopener noreferrer' }

// The message form floats in under the 3D copy at the Contact stop (placed with the
// CSS variables the 3D layout sets). Sending launches the paper plane.
export default function ContactPanel() {
  const open = useChapter() === chapterById.contact.index
  return (
    <div className="contact-panel" data-open={open} inert={!open}>
      <ContactForm onSent={() => stage.world?.flyPlane()} />
      <ul className="contact-socials">
        {socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} {...ext} className="hud-link">
              {s.label} <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
