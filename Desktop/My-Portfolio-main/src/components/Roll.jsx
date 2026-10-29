// Text that rolls up to an identical copy on hover (parent needs the `group` class).
export default function Roll({ children }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  )
}
