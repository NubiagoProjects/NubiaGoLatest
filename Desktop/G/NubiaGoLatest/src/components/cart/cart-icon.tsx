'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CartIconProps {
  className?: string
  iconClassName?: string
  showCount?: boolean
}

export function CartIcon({ className, iconClassName, showCount = true }: CartIconProps) {
  const router = useRouter()
  const { itemCount } = useCartStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative hover:bg-gray-100 rounded-full h-10 w-10", className)}
      onClick={() => router.push('/cart')}
      aria-label="Shopping Cart"
    >
      <ShoppingCart className={cn("h-5 w-5 text-gray-700", iconClassName)} />
      {showCount && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Button>
  )
}
