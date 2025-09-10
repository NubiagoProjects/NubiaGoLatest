'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveDashboardGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

export default function ResponsiveDashboardGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md'
}: ResponsiveDashboardGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  }

  const gridColsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const getGridClasses = () => {
    const classes = ['grid']
    
    // Default columns
    if (cols.default) {
      classes.push(gridColsClasses[cols.default as keyof typeof gridColsClasses])
    }
    
    // Responsive columns
    if (cols.sm) {
      classes.push(`sm:${gridColsClasses[cols.sm as keyof typeof gridColsClasses]}`)
    }
    if (cols.md) {
      classes.push(`md:${gridColsClasses[cols.md as keyof typeof gridColsClasses]}`)
    }
    if (cols.lg) {
      classes.push(`lg:${gridColsClasses[cols.lg as keyof typeof gridColsClasses]}`)
    }
    if (cols.xl) {
      classes.push(`xl:${gridColsClasses[cols.xl as keyof typeof gridColsClasses]}`)
    }
    
    return classes.join(' ')
  }

  return (
    <div className={cn(
      getGridClasses(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  className?: string
}

export function ResponsiveStatsCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  className
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      accent: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      accent: 'border-green-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      accent: 'border-yellow-200'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      accent: 'border-red-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      accent: 'border-purple-200'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      accent: 'border-gray-200'
    }
  }

  const colors = colorClasses[color]

  return (
    <div className={cn(
      'bg-white rounded-xl border-2 p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
      colors.accent,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={cn(
              'flex items-center mt-2 text-sm font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className={cn(
                'inline-block w-0 h-0 mr-1',
                trend.isPositive 
                  ? 'border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-green-600'
                  : 'border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-600'
              )} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ml-4',
            colors.bg
          )}>
            <div className={cn('w-6 h-6 sm:w-8 sm:h-8', colors.icon)}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Responsive Action Card Component
interface ActionCardProps {
  title: string
  description?: string
  icon?: ReactNode
  onClick?: () => void
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  className?: string
}

export function ResponsiveActionCard({
  title,
  description,
  icon,
  onClick,
  color = 'blue',
  className
}: ActionCardProps) {
  const colorClasses = {
    blue: 'hover:bg-blue-50 border-blue-200 text-blue-700',
    green: 'hover:bg-green-50 border-green-200 text-green-700',
    yellow: 'hover:bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'hover:bg-red-50 border-red-200 text-red-700',
    purple: 'hover:bg-purple-50 border-purple-200 text-purple-700',
    gray: 'hover:bg-gray-50 border-gray-200 text-gray-700'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full bg-white rounded-xl border-2 p-4 sm:p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] min-h-[44px] touch-manipulation',
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-current bg-opacity-10 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{title}</h3>
          {description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}
