'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { debounce } from '@/lib/utils'

interface UseInfiniteScrollOptions {
  threshold?: number
  debounceMs?: number
  enabled?: boolean
}

export function useInfiniteScroll({
  threshold = 100,
  debounceMs = 100,
  enabled = true
}: UseInfiniteScrollOptions = {}) {
  const [isFetching, setIsFetching] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && enabled && !isFetching) {
        setIsFetching(true)
      }
    },
    [enabled, isFetching]
  )

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    }

    const debouncedHandler = debounce(handleObserver, debounceMs)

    observerRef.current = new IntersectionObserver(debouncedHandler, options)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, debounceMs, handleObserver])

  useEffect(() => {
    const observer = observerRef.current
    const target = targetRef.current

    if (target && observer && enabled) {
      observer.observe(target)
    }

    return () => {
      if (target && observer) {
        observer.unobserve(target)
      }
    }
  }, [targetRef, enabled])

  const resetFetching = useCallback(() => {
    setIsFetching(false)
  }, [])

  return {
    targetRef,
    isFetching,
    resetFetching
  }
}
