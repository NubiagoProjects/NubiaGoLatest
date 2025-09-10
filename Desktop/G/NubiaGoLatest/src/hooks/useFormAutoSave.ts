'use client'

import { useState, useEffect, useCallback } from 'react'
import { debounce } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

interface UseFormAutoSaveOptions<T> {
  initialData: T
  onSave: (data: T) => Promise<void>
  debounceMs?: number
  enabled?: boolean
  storageKey?: string
}

export function useFormAutoSave<T extends object>({
  initialData,
  onSave,
  debounceMs = 1000,
  enabled = true,
  storageKey
}: UseFormAutoSaveOptions<T>) {
  const [data, setData] = useState<T>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { success, error } = useToast()

  // Load from local storage if storageKey is provided
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setData(parsedData)
        } catch (err) {
          console.error('Error loading saved form data:', err)
        }
      }
    }
  }, [storageKey])

  // Save to local storage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined' && hasUnsavedChanges) {
      localStorage.setItem(storageKey, JSON.stringify(data))
    }
  }, [data, storageKey, hasUnsavedChanges])

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: T) => {
      if (!enabled || !hasUnsavedChanges) return

      try {
        setIsSaving(true)
        await onSave(data)
        setHasUnsavedChanges(false)
        success('Changes saved successfully')
      } catch (err) {
        console.error('Error saving form:', err)
        error('Failed to save changes')
      } finally {
        setIsSaving(false)
      }
    }, debounceMs),
    [enabled, hasUnsavedChanges, onSave, debounceMs]
  )

  // Update data and trigger save
  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => {
      const newData = { ...prev, ...updates }
      setHasUnsavedChanges(true)
      debouncedSave(newData)
      return newData
    })
  }, [debouncedSave])

  // Force save
  const forceSave = useCallback(async () => {
    if (!enabled || !hasUnsavedChanges) return

    try {
      setIsSaving(true)
      await onSave(data)
      setHasUnsavedChanges(false)
      success('Changes saved successfully')
    } catch (err) {
      console.error('Error saving form:', err)
      error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }, [enabled, hasUnsavedChanges, data, onSave])

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
    setData(initialData)
    setHasUnsavedChanges(false)
  }, [storageKey, initialData])

  // Warn before unload if there are unsaved changes
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, hasUnsavedChanges])

  return {
    data,
    updateData,
    isSaving,
    hasUnsavedChanges,
    forceSave,
    clearSavedData
  }
}
