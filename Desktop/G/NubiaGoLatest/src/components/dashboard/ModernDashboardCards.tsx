'use client'

import React from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardCard {
  id: string
  title: string
  value: string | number
  icon: React.ComponentType<any>
  color: 'blue' | 'orange' | 'purple' | 'green' | 'red' | 'yellow' | 'gray'
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down'
  }
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface ModernDashboardCardsProps {
  cards: DashboardCard[]
  loading?: boolean
  theme: 'blue' | 'orange' | 'purple'
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-600',
    border: 'border-orange-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
    border: 'border-red-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-600',
    text: 'text-gray-600',
    border: 'border-gray-200'
  }
}

export default function ModernDashboardCards({ cards, loading = false, theme }: ModernDashboardCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        const colors = colorConfig[card.color]
        
        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colors.icon)}>
                <Icon className="h-6 w-6" />
              </div>
              {card.trend && (
                <div className={cn(
                  "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                  card.trend.direction === 'up' 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  {card.trend.direction === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{card.trend.value}%</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              )}
              {card.trend && (
                <p className="text-xs text-gray-500">{card.trend.label}</p>
              )}
            </div>

            {/* Action */}
            {card.action && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={card.action.onClick}
                  className={cn(
                    "text-sm font-medium hover:underline transition-colors",
                    colors.text
                  )}
                >
                  {card.action.label}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Progress Card Component
interface ProgressCardProps {
  title: string
  value: number
  max: number
  color: 'blue' | 'orange' | 'purple' | 'green' | 'red' | 'yellow'
  icon: React.ComponentType<any>
  subtitle?: string
}

export function ProgressCard({ title, value, max, color, icon: Icon, subtitle }: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100)
  const colors = colorConfig[color]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{value}/{max}</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-500", colors.text.replace('text-', 'bg-'))}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

// Activity Card Component
interface ActivityItem {
  id: string
  title: string
  description: string
  time: string
  icon: React.ComponentType<any>
  color: 'blue' | 'orange' | 'purple' | 'green' | 'red' | 'yellow'
}

interface ActivityCardProps {
  title: string
  activities: ActivityItem[]
  viewAllLink?: string
}

export function ActivityCard({ title, activities, viewAllLink }: ActivityCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {viewAllLink && (
          <a href={viewAllLink} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View All
          </a>
        )}
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          const colors = colorConfig[activity.color]
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colors.icon)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
