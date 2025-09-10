'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { wishlistService } from '@/lib/services/wishlist.service'

export function useWishlist() {
  const { user } = useAuth()
  const [wishlistItemCount, setWishlistItemCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchWishlistCount = useCallback(async () => {
    if (!user?.uid) {
      setWishlistItemCount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const wishlist = await wishlistService.getWishlist(user.uid)
      setWishlistItemCount(wishlist.items.length)
      setError(null)
    } catch (err) {
      console.error('Error fetching wishlist count:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch wishlist'))
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid])

  // Initial fetch
  useEffect(() => {
    fetchWishlistCount()
  }, [fetchWishlistCount])

  return {
    wishlistItemCount,
    isLoading,
    error,
    refreshWishlist: fetchWishlistCount
  }
}
