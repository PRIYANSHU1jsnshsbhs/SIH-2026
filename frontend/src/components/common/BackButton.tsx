import { useNavigate } from 'react-router-dom'

/** navigate(-1) returns to wherever the user actually came from (list, search, another
 *  investigation) rather than a hardcoded parent route, which is the right behavior
 *  for pages reachable from several different places (graph, findings, progress, etc). */
export function BackButton({ fallback }: { fallback?: string }) {
  const navigate = useNavigate()

  function goBack() {
    if (window.history.length > 1) navigate(-1)
    else navigate(fallback ?? '/dashboard')
  }

  return (
    <button
      onClick={goBack}
      className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary"
    >
      <span aria-hidden>←</span>
      Back
    </button>
  )
}
