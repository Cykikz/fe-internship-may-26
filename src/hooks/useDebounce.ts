import { useState, useEffect } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after
 * `delay` ms have elapsed since the last change.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timerId)
  }, [value, delay])

  return debouncedValue
}