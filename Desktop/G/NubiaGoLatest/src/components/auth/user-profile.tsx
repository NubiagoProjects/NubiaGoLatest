'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin, Settings, LogOut, Edit, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { toast } from '@/components/ui/toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }).optional(),
})

const preferencesSchema = z.object({
  notifications: z.boolean(),
  marketing: z.boolean(),
  language: z.string(),
  currency: z.string(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type PreferencesFormData = z.infer<typeof preferencesSchema>

interface UserProfileProps {
  onClose?: () => void
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  
  const { user, updateUserProfile, signOut } = useFirebaseAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '', // Phone not available in Firebase User type
    },
  })

  const {
    register: registerPrefs,
    handleSubmit: handleSubmitPrefs,
    formState: { errors: prefErrors },
    reset: resetPrefs,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      notifications: true,
      marketing: false,
      language: 'en',
      currency: 'USD',
    },
  })

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    
    try {
      await updateUserProfile(data.name)
      toast.success('Profile updated', 'Your profile has been updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Update failed', 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesSubmit = async (data: PreferencesFormData) => {
    setIsLoading(true)
    
    try {
      // Mock preferences update
      toast.success('Preferences updated', 'Your preferences have been updated successfully')
    } catch (error) {
      toast.error('Update failed', 'Failed to update preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    signOut()
    toast.success('Logged out', 'You have been logged out successfully')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    reset()
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user.displayName}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Preferences
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  className="pl-10"
                  {...register('name')}
                  error={errors.name?.message}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10"
                  {...register('phone')}
                  error={errors.phone?.message}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Address Fields */}
            {/* Address functionality removed - User interface doesn't have address property */}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmitPrefs(handlePreferencesSubmit)} className="space-y-6">
            {/* Notification Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...registerPrefs('notifications')}
                    className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...registerPrefs('marketing')}
                    className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Marketing emails</span>
                </label>
              </div>
            </div>

            {/* Language and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  id="language"
                  {...registerPrefs('language')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  {...registerPrefs('currency')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 
