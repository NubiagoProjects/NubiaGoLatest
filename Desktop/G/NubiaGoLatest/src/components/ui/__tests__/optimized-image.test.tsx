// ============================================================================
// OPTIMIZED IMAGE COMPONENT TESTS
// ============================================================================

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import OptimizedImage from '../optimized-image'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className, priority, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onError={onError}
        {...props}
      />
    )
  }
})

describe('OptimizedImage Component', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image'
  }

  describe('basic functionality', () => {
    it('should render image with correct attributes', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByAltText('Test image')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
      expect(img).toHaveAttribute('alt', 'Test image')
    })

    it('should apply default width and height', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('width', '400')
      expect(img).toHaveAttribute('height', '400')
    })

    it('should apply custom width and height', () => {
      render(<OptimizedImage {...defaultProps} width={400} height={300} />)

      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('width', '400')
      expect(img).toHaveAttribute('height', '300')
    })

    it('should apply custom className', () => {
      render(<OptimizedImage {...defaultProps} className="custom-class" />)

      const img = screen.getByAltText('Test image')
      expect(img).toHaveClass('custom-class')
    })
  })

  describe('lazy loading', () => {
    it('should enable lazy loading by default', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('loading', 'lazy')
    })

    it('should disable lazy loading when priority is true', () => {
      render(<OptimizedImage {...defaultProps} priority={true} />)

      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('loading', 'eager')
    })
  })

  describe('error handling', () => {
    it('should show fallback image on error', async () => {
      render(<OptimizedImage {...defaultProps} fallbackSrc="/fallback.jpg" />)

      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')

      // Simulate error
      fireEvent.error(img)

      // Should now show fallback
      expect(img).toHaveAttribute('src', '/fallback.jpg')
    })

    it('should handle error state properly', async () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByAltText('Test image')
      
      // Simulate error
      fireEvent.error(img)

      // Should show fallback
      expect(img).toHaveAttribute('src', '/fallback-product.jpg')
    })
  })

  describe('fallback behavior', () => {
    it('should use default fallback when not specified', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByAltText('Test image')
      
      // Simulate error
      fireEvent.error(img)

      // Should use default fallback
      expect(img).toHaveAttribute('src', '/fallback-product.jpg')
    })

    it('should use custom fallback when specified', () => {
      render(<OptimizedImage {...defaultProps} fallbackSrc="/custom-fallback.jpg" />)

      const img = screen.getByAltText('Test image')
      
      // Simulate error
      fireEvent.error(img)

      // Should use custom fallback
      expect(img).toHaveAttribute('src', '/custom-fallback.jpg')
    })
  })
}) 
