/**
 * Renders `text` with every occurrence of `query` wrapped in a
 * <mark> tag styled to match the dark theme.
 */
export function Highlight({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim()

  if (!trimmed) return <>{text}</>

  // Split on the query (case-insensitive), keeping the matched parts
  const parts = text.split(new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={i} className="bg-indigo-500/30 text-indigo-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}