'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'
import { isMobile as checkIsMobile } from '@/lib/mobile-detection'

interface DashboardCard {
  id: string
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down'
  }
  color?: 'primary' | 'green' | 'blue' | 'yellow' | 'red' | 'purple'
  subtitle?: string
  onClick?: () => void
}

interface ResponsiveDashboardCardsProps {
  cards: DashboardCard[]
  loading?: boolean
}

export default function ResponsiveDashboardCards({
  cards,
  loading = false
}: ResponsiveDashboardCardsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(checkIsMobile())
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const getColorClasses = (color: string = 'primary') => {
    const colorMap = {
      primary: {
        icon: 'text-primary-600',
        trend: 'text-primary-600',
        bg: 'bg-primary-50',
        hover: 'hover:bg-primary-100'
      },
      green: {
        icon: 'text-green-600',
        trend: 'text-green-600',
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100'
      },
      blue: {
        icon: 'text-blue-600',
        trend: 'text-blue-600',
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100'
      },
      yellow: {
        icon: 'text-yellow-600',
        trend: 'text-yellow-600',
        bg: 'bg-yellow-50',
        hover: 'hover:bg-yellow-100'
      },
      red: {
        icon: 'text-red-600',
        trend: 'text-red-600',
        bg: 'bg-red-50',
        hover: 'hover:bg-red-100'
      },
      purple: {
        icon: 'text-purple-600',
        trend: 'text-purple-600',
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.primary
  }

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toLocaleString()
    }
    return value
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 lg:p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'}`}>
      {cards.map((card) => {
        const Icon = card.icon
        const colors = getColorClasses(card.color)
        const TrendIcon = card.trend?.direction === 'up' ? ArrowUpRight : ArrowDownRight
        const TrendIndicator = card.trend?.direction === 'up' ? TrendingUp : TrendingDown
        
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl shadow-sm p-4 lg:p-6 transition-all duration-200 ${
              card.onClick ? `cursor-pointer hover:shadow-md ${colors.hover} touch-manipulation` : ''
            }`}
            onClick={card.onClick}
          >
            {/* Header with Icon and Trend Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${colors.icon}`} />
              </div>
              {card.trend && (
                <div className={`flex items-center ${
                  card.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIndicator className="h-4 w-4 lg:h-5 lg:w-5" />
                </div>
              )}
            </div>

            {/* Value */}
            <div className="mb-2">
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {formatValue(card.value)}
              </p>
            </div>

            {/* Title */}
            <div className="mb-2">
              <p className="text-sm lg:text-base text-gray-600 font-medium">
                {card.title}
              </p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">
                  {card.subtitle}
                </p>
              )}
            </div>

            {/* Trend Information */}
            {card.trend && (
              <div className="flex items-center space-x-1">
                <TrendIcon className={`h-3 w-3 lg:h-4 lg:w-4 ${
                  card.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`text-xs lg:text-sm font-medium ${
                  card.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.trend.direction === 'up' ? '+' : ''}{card.trend.value}%
                </span>
                <span className="text-xs lg:text-sm text-gray-500">
                  {card.trend.label}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Quick Stats Component for smaller metrics
interface QuickStat {
  label: string
  value: string | number
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray'
  icon?: React.ComponentType<{ className?: string }>
}

interface ResponsiveQuickStatsProps {
  stats: QuickStat[]
  title?: string
}

export function ResponsiveQuickStats({
  stats,
  title = "Quick Stats"
}: ResponsiveQuickStatsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(checkIsMobile())
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const getStatColor = (color: string = 'gray') => {
    const colorMap = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      gray: 'bg-gray-500'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3 lg:space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg ${
              isMobile ? 'touch-manipulation' : ''
            }`}>
              <div className="flex items-center space-x-3">
                {Icon ? (
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                  </div>
                ) : (
                  <div className={`w-3 h-3 lg:w-4 lg:h-4 ${getStatColor(stat.color)} rounded-full`}></div>
                )}
                <span className="text-sm lg:text-base font-medium text-gray-900">{stat.label}</span>
              </div>
              <span className="text-sm lg:text-base text-gray-600 font-medium">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
