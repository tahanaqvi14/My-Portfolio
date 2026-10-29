import { aboutStatement, achievements, facts, journey, mern, person, projects, socials, tags } from '../data/content'
import { useMode } from '../lib/stage'
import ContactPanel from '../components/ContactPanel'

// The page's real content, in order. Visually it is drawn in 3D by the world; here it
// stays readable for screen readers and search, gives each stop its scroll length,
// and becomes the visible page when WebGL is unavailable.
export default function Content() {
  // With the 3D world running, the HUD offers these links; keep them out of the tab order here.
  const ext = { target: '_blank', rel: 'noopener noreferrer', tabIndex: useMode() === 'webgl' ? -1 : undefined }
  return (
    <>
      <section id="home" className="station">
        <div className="station-copy">
          <h1>{person.name} — Software Engineer and Full-Stack Developer</h1>
          <p>Full-stack software engineer building reliable systems, AI products and real-time apps.</p>
          <p>
            {person.location} · {person.coordinates}
          </p>
        </div>
      </section>

      <section id="intent" className="station">
        <div className="station-copy">
          <h2>Intent</h2>
          <p>{aboutStatement}</p>
        </div>
      </section>

      <section id="about" className="station">
        <div className="station-copy">
          <h2>Based in Karachi. Building for everywhere.</h2>
          <p>
            I’m {person.fullName}, a Computer &amp; Information Systems engineering student at NED University and a
            part-time engineer at ACE Systems. I design and build full-stack products end to end: the interface, the API,
            the database and the AI in between.
          </p>
          <dl>
            {facts
              .filter((f) => f.label !== 'Name')
              .map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </section>

      <section id="toolbox" className="station">
        <div className="station-copy">
          <h2>MERN at the core. The right tool around it.</h2>
          <p>Home stack: {mern.map((m) => m.name).join(', ')}.</p>
          <ul>
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {projects.map((p, i) => (
        <section key={p.id} id={p.id} className="station">
          <div className="station-copy">
            {i === 0 && <h2>Selected work</h2>}
            <h3>{p.title}</h3>
            <p>
              {p.date} · {p.status.label}
            </p>
            <p>{p.tagline}</p>
            <p>{p.description}</p>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p>Built with {p.stack.join(', ')}.</p>
            <p>
              <a href={p.links.demo} {...ext}>
                {p.title} live demo
              </a>{' '}
              ·{' '}
              <a href={p.links.code} {...ext}>
                {p.title} source code
              </a>
            </p>
          </div>
        </section>
      ))}

      <section id="journey" className="station">
        <div className="station-copy">
          <h2>The path so far.</h2>
          <ol>
            {journey.map((item) => (
              <li key={item.org}>
                <h3>{item.org}</h3>
                <p>
                  {item.period} · {item.role}
                </p>
                <ul>
                  {item.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <h3>Recognition</h3>
          <ul>
            {achievements.map((a) => (
              <li key={a.title}>
                {a.title} — {a.detail}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="station">
        <div className="station-copy">
          <h2>Got an idea? Send it flying.</h2>
          <p>Write a few lines and press send — the message goes straight to my inbox.</p>
        </div>
        <ContactPanel />
      </section>

      <section id="fin" className="station">
        <div className="station-copy">
          <h2>Thanks for scrolling.</h2>
          <p>If something here sparked an idea, I’d love to hear about it.</p>
          <ul>
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} {...ext}>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href={person.resume} download="Taha-Naqvi-Resume.pdf" tabIndex={ext.tabIndex}>
                Résumé (PDF)
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
