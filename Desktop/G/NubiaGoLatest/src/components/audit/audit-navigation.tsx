'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Eye, 
  Smartphone, 
  Palette, 
  Globe, 
  Zap, 
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Star,
  Award,
  Target,
  Users,
  Monitor,
  Tablet,
  Smartphone as MobileIcon,
  Home,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Shield,
  Heart,
  Zap as Lightning,
  Globe as World,
  Palette as Design,
  Smartphone as Mobile,
  Users as Accessibility,
  BarChart3 as Analytics,
  Settings as Config,
  HelpCircle,
  Info,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// 🧠 Missing icon components
const Brain = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const TestTube = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// 🚀 NAVIGATION INTERFACES
interface AuditTool {
  name: string
  description: string
  icon: React.ComponentType<any>
  href: string
  status: 'active' | 'beta' | 'coming-soon'
  category: 'core' | 'advanced' | 'experimental'
}

interface AuditCategory {
  name: string
  description: string
  tools: AuditTool[]
  color: string
}

// 🎯 AUDIT TOOLS CONFIGURATION
const auditTools: AuditTool[] = [
  // Core Tools
  {
    name: 'Dashboard Overview',
    description: 'Comprehensive platform audit with metrics and insights',
    icon: BarChart3,
    href: '/audit-dashboard',
    status: 'active',
    category: 'core'
  },
  {
    name: 'Component Auditor',
    description: 'Deep-dive analysis of individual components',
    icon: Eye,
    href: '/component-auditor',
    status: 'active',
    category: 'core'
  },
  {
    name: 'Accessibility Checker',
    description: 'WCAG 2.1 AA compliance and screen reader support',
    icon: Accessibility,
    href: '/accessibility-audit',
    status: 'active',
    category: 'core'
  },
  {
    name: 'Design System Analyzer',
    description: 'Design consistency and component library validation',
    icon: Design,
    href: '/design-system-audit',
    status: 'active',
    category: 'core'
  },
  
  // Advanced Tools
  {
    name: 'Mobile Optimization',
    description: 'Touch targets, responsive design, and mobile-first validation',
    icon: Mobile,
    href: '/mobile-audit',
    status: 'active',
    category: 'advanced'
  },
  {
    name: 'Performance Monitor',
    description: 'Bundle size, loading times, and optimization metrics',
    icon: Lightning,
    href: '/performance-audit',
    status: 'active',
    category: 'advanced'
  },
  {
    name: 'Cultural Relevance',
    description: 'African market optimization and cultural sensitivity',
    icon: World,
    href: '/cultural-audit',
    status: 'active',
    category: 'advanced'
  },
  {
    name: 'User Experience Flow',
    description: 'User journey analysis and conversion optimization',
    icon: TrendingUp,
    href: '/ux-flow-audit',
    status: 'active',
    category: 'advanced'
  },
  
  // Experimental Tools
  {
    name: 'AI-Powered Insights',
    description: 'Machine learning analysis and predictive recommendations',
    icon: Brain,
    href: '/ai-insights',
    status: 'beta',
    category: 'experimental'
  },
  {
    name: 'Real-time Monitoring',
    description: 'Live performance tracking and alerting system',
    icon: Monitor,
    href: '/real-time-monitor',
    status: 'coming-soon',
    category: 'experimental'
  },
  {
    name: 'A/B Testing Suite',
    description: 'Split testing and conversion optimization tools',
    icon: TestTube,
    href: '/ab-testing',
    status: 'coming-soon',
    category: 'experimental'
  }
]

// 🎨 CATEGORY CONFIGURATION
const auditCategories: AuditCategory[] = [
  {
    name: 'Core Audit Tools',
    description: 'Essential tools for comprehensive platform analysis',
    tools: auditTools.filter(tool => tool.category === 'core'),
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Advanced Analysis',
    description: 'Specialized tools for deep-dive optimization',
    tools: auditTools.filter(tool => tool.category === 'advanced'),
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Experimental Features',
    description: 'Cutting-edge tools in development',
    tools: auditTools.filter(tool => tool.category === 'experimental'),
    color: 'from-orange-500 to-orange-600'
  }
]

// 🚀 MAIN AUDIT NAVIGATION
export default function AuditNavigation() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 🔍 FILTER TOOLS
  const filteredTools = auditTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 🎯 GET STATUS BADGE
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      case 'beta':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Beta
        </span>
      case 'coming-soon':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="h-3 w-3 mr-1" />
          Coming Soon
        </span>
      default:
        return null
    }
  }

  // 🎨 GET CATEGORY COLOR
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'experimental': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 🎯 HERO HEADER */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🛠️ NubiaGo Audit Toolkit
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Your Complete Arsenal for UI/UX Excellence! Choose Your Weapon of Choice! ⚔️✨
            </p>
            
            {/* 🔍 SEARCH & FILTERS */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search audit tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-4 border border-white/20 rounded-full text-white bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  <option value="all">All Categories</option>
                  <option value="core">Core Tools</option>
                  <option value="advanced">Advanced</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ AUDIT TOOLS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 📊 QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Active Tools</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {auditTools.filter(t => t.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Ready to use</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Beta Tools</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {auditTools.filter(t => t.status === 'beta').length}
            </div>
            <div className="text-sm text-gray-600">Testing phase</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Categories</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {auditCategories.length}
            </div>
            <div className="text-sm text-gray-600">Tool types</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Tools</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {auditTools.length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
        </div>

        {/* 🎯 TOOLS BY CATEGORY */}
        {auditCategories.map((category) => (
          <div key={category.name} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category.tools[0]?.category)}`}>
                  {category.tools.length} tools
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tools
                .filter(tool => filteredTools.includes(tool))
                .map((tool) => (
                <div key={tool.name} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      {getStatusBadge(tool.status)}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {tool.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
                        {tool.category}
                      </span>
                      
                      {tool.status === 'active' ? (
                        <Link href={tool.href}>
                          <Button
                            className="bg-primary-600 hover:bg-primary-700"
                            size="sm"
                            rightIcon={<ArrowRight className="h-4 w-4" />}
                          >
                            Launch Tool
                          </Button>
                        </Link>
                      ) : tool.status === 'beta' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          disabled
                        >
                          Beta Access
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-500"
                          disabled
                        >
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 🚀 QUICK ACTIONS */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Full Audit</h3>
              <p className="text-gray-600 mb-4">Run comprehensive platform analysis</p>
              <Link href="/audit-dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Launch Dashboard
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Component Analysis</h3>
              <p className="text-gray-600 mb-4">Deep-dive into specific components</p>
              <Link href="/component-auditor">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Analyze Component
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Reports</h3>
              <p className="text-gray-600 mb-4">Download detailed audit reports</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* 📚 RESOURCES & HELP */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📚 Resources & Help
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600">Learn how to use each tool</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Info className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Best Practices</h3>
              <p className="text-sm text-gray-600">UI/UX optimization guidelines</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">External Tools</h3>
              <p className="text-sm text-gray-600">Additional resources</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Configuration</h3>
              <p className="text-sm text-gray-600">Customize audit settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
