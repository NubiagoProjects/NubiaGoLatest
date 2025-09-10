import {
  formatCurrency,
  formatPrice,
  formatPriceRange,
  formatNumber,
  formatCompactNumber,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  capitalize,
  capitalizeWords,
  truncateText,
  slugify,
  formatPhoneNumber,
  formatFileSize,
  formatPercentage,
  formatRating,
  formatAddress,
  formatCreditCard,
  maskEmail,
  maskPhone,
  formatValidationError,
  formatDuration
} from '../formatting'

describe('Formatting Functions', () => {
  describe('Currency formatting', () => {
    it('formats currency with default USD currency', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1,234.56')
      expect(result).toContain('$')
    })

    it('formats currency with custom currency', () => {
      expect(formatCurrency(1234.56, 'USD')).toContain('$')
    })

    it('formats price correctly', () => {
      const result = formatPrice(999.99)
      expect(result).toContain('999.99')
      expect(result).toContain('$')
    })

    it('formats price range correctly', () => {
      const result = formatPriceRange(100, 200)
      expect(result).toContain('100')
      expect(result).toContain('200')
      expect(result).toContain('$')
    })

    it('formats single price when min equals max', () => {
      const result = formatPriceRange(100, 100)
      expect(result).toContain('100')
      expect(result).toContain('$')
    })
  })

  describe('Number formatting', () => {
    it('formats numbers with Nigerian locale', () => {
      expect(formatNumber(1234567)).toBe('1,234,567')
    })

    it('formats compact numbers', () => {
      expect(formatCompactNumber(1000)).toBe('1K')
      expect(formatCompactNumber(1500000)).toBe('1.5M')
    })
  })

  describe('Date formatting', () => {
    it('formats date with short format', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date)).toMatch(/25 Dec 2023/)
    })

    it('formats date with long format', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date, 'long')).toMatch(/25 December 2023/)
    })

    it('formats date string', () => {
      expect(formatDate('2023-12-25')).toMatch(/25 Dec 2023/)
    })

    it('formats date time', () => {
      const date = new Date('2023-12-25T14:30:00')
      expect(formatDateTime(date)).toMatch(/25 Dec 2023/)
      expect(formatDateTime(date)).toMatch(/14:30/)
    })

    it('formats relative time correctly', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      expect(formatRelativeTime(oneMinuteAgo)).toContain('minute')
      expect(formatRelativeTime(oneHourAgo)).toContain('hour')
      expect(formatRelativeTime(oneDayAgo)).toContain('day')
    })

    it('shows "Just now" for very recent times', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('Just now')
    })
  })

  describe('Text formatting', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
    })

    it('capitalizes all words', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World')
      expect(capitalizeWords('john doe smith')).toBe('John Doe Smith')
    })

    it('truncates text correctly', () => {
      expect(truncateText('Hello world', 5)).toBe('Hello...')
      expect(truncateText('Short', 10)).toBe('Short')
    })

    it('slugifies text correctly', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
      expect(slugify('Product Name (2023)')).toBe('product-name-2023')
    })
  })

  describe('Phone number formatting', () => {
    it('formats Nigerian numbers starting with 234', () => {
      expect(formatPhoneNumber('2348012345678')).toBe('+234 801 234 5678')
    })

    it('formats Nigerian numbers starting with 0', () => {
      expect(formatPhoneNumber('08012345678')).toBe('+234 801 234 5678')
    })

    it('returns original format for unrecognized patterns', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('123-456-7890')
    })
  })

  describe('File size formatting', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('handles decimal sizes', () => {
      expect(formatFileSize(1500)).toBe('1.46 KB')
    })
  })

  describe('Percentage and rating formatting', () => {
    it('formats percentage correctly', () => {
      expect(formatPercentage(75.5)).toBe('75.5%')
      expect(formatPercentage(100, 0)).toBe('100%')
    })

    it('formats rating correctly', () => {
      expect(formatRating(4.5, 123)).toBe('4.5 (123 reviews)')
    })
  })

  describe('Address formatting', () => {
    it('formats complete address', () => {
      const address = {
        street: '123 Main St',
        city: 'Lagos',
        state: 'Lagos',
        postalCode: '100001',
        country: 'Nigeria'
      }
      expect(formatAddress(address)).toBe('123 Main St, Lagos, Lagos, 100001, Nigeria')
    })

    it('handles partial address', () => {
      const address = {
        city: 'Lagos',
        country: 'Nigeria'
      }
      expect(formatAddress(address)).toBe('Lagos, Nigeria')
    })

    it('handles empty address', () => {
      expect(formatAddress({})).toBe('')
    })
  })

  describe('Credit card formatting', () => {
    it('formats credit card number', () => {
      expect(formatCreditCard('1234567890123456')).toBe('1234 5678 9012 3456')
    })

    it('handles non-numeric characters', () => {
      expect(formatCreditCard('1234-5678-9012-3456')).toBe('1234 5678 9012 3456')
    })
  })

  describe('Data masking', () => {
    it('masks email addresses', () => {
      expect(maskEmail('john.doe@example.com')).toBe('j******e@example.com')
      expect(maskEmail('ab@example.com')).toBe('ab@example.com')
    })

    it('masks phone numbers', () => {
      expect(maskPhone('08012345678')).toBe('*******5678')
      expect(maskPhone('123')).toBe('123')
    })
  })

  describe('Validation error formatting', () => {
    it('formats validation errors', () => {
      const errors = {
        email: ['Invalid email'],
        password: ['Too short', 'Missing uppercase']
      }
      expect(formatValidationError(errors)).toBe('Invalid email, Too short, Missing uppercase')
    })
  })

  describe('Duration formatting', () => {
    it('formats duration in hours, minutes, seconds', () => {
      expect(formatDuration(3661)).toBe('1h 1m 1s')
    })

    it('formats duration in minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s')
    })

    it('formats duration in seconds only', () => {
      expect(formatDuration(45)).toBe('45s')
    })

    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0s')
    })
  })
})
