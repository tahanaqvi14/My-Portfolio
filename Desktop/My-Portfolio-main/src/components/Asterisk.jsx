// The site's mark: a six-spoke asterisk, drawn as strokes so it stays crisp at any size.
export default function Asterisk({ className = '', strokeWidth = 11 }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {[0, 60, 120].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="8"
          x2="50"
          y2="92"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
    </svg>
  )
}
