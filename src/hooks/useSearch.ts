import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tracks the latest request so stale responses are discarded.
  // Using a ref keeps the value mutable without causing re-renders.
  const requestIdRef = useRef(0)

  useEffect(() => {
    // Debounce: schedule the search 300 ms after the last keystroke.
    const timerId = setTimeout(async () => {
      // Claim a unique ID for this request.
      const thisRequestId = ++requestIdRef.current

      setIsLoading(true)
      setError(null)

      try {
        const data = await searchItems(query)

        // Stale-response guard: only apply results if this is still the latest request.
        if (thisRequestId === requestIdRef.current) {
          setResults(data)
        }
      } catch (err) {
        if (thisRequestId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
          setResults([])
        }
      } finally {
        if (thisRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }, 300)

    // Cleanup: cancel the pending timer if the query changes before 300 ms,
    // or if the component unmounts. Prevents timer leaks and state updates
    // on an unmounted component.
    return () => clearTimeout(timerId)
  }, [query])

  return { query, setQuery, results, isLoading, error }
}