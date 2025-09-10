import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'yellow' | 'black'
  size?: 'sm' | 'md' | 'lg'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full font-medium"
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    }
    
    const variantClasses = {
      default: 'bg-neutral-100 text-neutral-900',
      primary: 'bg-primary-100 text-primary-900',
      secondary: 'bg-neutral-100 text-neutral-900',
      success: 'bg-success-100 text-success-900',
      warning: 'bg-warning-100 text-warning-900',
      error: 'bg-error-100 text-error-900',
      yellow: 'bg-yellow-100 text-yellow-900',
      black: 'bg-neutral-900 text-white',
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size as keyof typeof sizeClasses],
          variantClasses[variant as keyof typeof variantClasses],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
