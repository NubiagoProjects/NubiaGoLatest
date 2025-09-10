import { cn, formatPrice, formatDate, generateId, debounce, throttle, getImageFallback, handleImageError, toast } from '../utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('handles empty inputs', () => {
      expect(cn()).toBe('')
    })

    it('handles single class', () => {
      expect(cn('single')).toBe('single')
    })
  })

  describe('formatPrice function', () => {
    it('formats price with default USD currency', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56')
    })

    it('formats price with custom currency', () => {
      expect(formatPrice(1234.56, 'EUR')).toBe('€1,234.56')
    })

    it('handles zero price', () => {
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('handles negative price', () => {
      expect(formatPrice(-123.45)).toBe('-$123.45')
    })

    it('handles large numbers', () => {
      expect(formatPrice(999999.99)).toBe('$999,999.99')
    })
  })

  describe('formatDate function', () => {
    it('formats Date object', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date)).toBe('December 25, 2023')
    })

    it('formats date string', () => {
      expect(formatDate('2023-12-25')).toBe('December 25, 2023')
    })

    it('handles ISO date string', () => {
      expect(formatDate('2023-12-25T10:30:00Z')).toBe('December 25, 2023')
    })

    it('handles different date formats', () => {
      expect(formatDate('2023-01-01')).toBe('January 1, 2023')
    })
  })

  describe('generateId function', () => {
    it('generates a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('generates IDs with correct length', () => {
      const id = generateId()
      expect(id.length).toBe(9)
    })

    it('generates alphanumeric IDs', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('debounce function', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls when called again', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      jest.advanceTimersByTime(50)
      debouncedFn()
      jest.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments correctly', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2')
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('throttle function', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('executes function immediately on first call', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('throttles subsequent calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn() // First call - executes immediately
      throttledFn() // Second call - should be throttled
      throttledFn() // Third call - should be throttled

      expect(mockFn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)
      throttledFn() // Should execute now
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('passes arguments correctly', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('arg1', 'arg2')
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('getImageFallback function', () => {
    it('returns image URL when provided', () => {
      const imageUrl = 'https://example.com/image.jpg'
      expect(getImageFallback(imageUrl)).toBe(imageUrl)
    })

    it('returns default fallback when image URL is empty', () => {
      expect(getImageFallback('')).toBe('/fallback-product.jpg')
    })

    it('returns default fallback when image URL is null', () => {
      expect(getImageFallback(null as any)).toBe('/fallback-product.jpg')
    })

    it('returns default fallback when image URL is undefined', () => {
      expect(getImageFallback(undefined as any)).toBe('/fallback-product.jpg')
    })

    it('returns custom fallback when provided', () => {
      const customFallback = '/custom-fallback.jpg'
      expect(getImageFallback('', customFallback)).toBe(customFallback)
    })
  })

  describe('handleImageError function', () => {
    it('sets fallback image and alt text on error', () => {
      const mockEvent = {
        target: {
          src: 'https://example.com/broken-image.jpg',
          alt: 'Original alt'
        }
      } as any

      handleImageError(mockEvent)

      expect(mockEvent.target.src).toBe('/fallback-product.jpg')
      expect(mockEvent.target.alt).toBe('Image not available')
    })

    it('handles event with different target structure', () => {
      const mockEvent = {
        target: {
          src: 'https://example.com/image.jpg',
          alt: 'Test alt'
        }
      } as any

      handleImageError(mockEvent)

      expect(mockEvent.target.src).toBe('/fallback-product.jpg')
      expect(mockEvent.target.alt).toBe('Image not available')
    })
  })

  describe('toast functions', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(console, 'warn').mockImplementation()
      jest.spyOn(console, 'info').mockImplementation()
    })

    afterEach(() => {
      consoleSpy.mockRestore()
      jest.restoreAllMocks()
    })

    it('calls success toast with correct message', () => {
      toast.success('Operation completed')
      expect(console.log).toHaveBeenCalledWith('✅ Success:', 'Operation completed')
    })

    it('calls error toast with correct message', () => {
      toast.error('Something went wrong')
      expect(console.error).toHaveBeenCalledWith('❌ Error:', 'Something went wrong')
    })

    it('calls warning toast with correct message', () => {
      toast.warning('Please check your input')
      expect(console.warn).toHaveBeenCalledWith('⚠️ Warning:', 'Please check your input')
    })

    it('calls info toast with correct message', () => {
      toast.info('New update available')
      expect(console.info).toHaveBeenCalledWith('ℹ️ Info:', 'New update available')
    })
  })
})
