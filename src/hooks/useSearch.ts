import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'
import { useDebounce } from './debounce'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  // Initialise query from URL on first render (?q=react)
  const [query, setQueryState] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('q') ?? ''
  })
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestIdRef = useRef(0)

  // Debounce the raw query through the reusable hook (300 ms)
  const debouncedQuery = useDebounce(query, 300)

  // Sync query changes back to the URL without pushing a new history entry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    const newUrl = query
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [query])

  // Fire the search once the debounced value settles
  useEffect(() => {
    const thisRequestId = ++requestIdRef.current

    setIsLoading(true)
    setError(null)

    searchItems(debouncedQuery)
      .then(data => {
        if (thisRequestId === requestIdRef.current) {
          setResults(data)
        }
      })
      .catch(err => {
        if (thisRequestId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
          setResults([])
        }
      })
      .finally(() => {
        if (thisRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      })
  }, [debouncedQuery])

  const setQuery = (q: string) => setQueryState(q)

  return { query, setQuery, results, isLoading, error }
}