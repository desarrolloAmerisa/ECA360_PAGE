import { useCallback, useEffect, useRef, useState } from 'react'

export function useInfiniteScroll(hasMore, loading, onLoadMore) {
  const sentinelRef = useRef(null)

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore()
      }
    },
    [hasMore, loading, onLoadMore],
  )

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [handleIntersect])

  return sentinelRef
}

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
