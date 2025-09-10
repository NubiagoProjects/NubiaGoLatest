import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  Input, 
  TextArea, 
  Select, 
  Checkbox, 
  Radio, 
  FormField,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired
} from '../form'

// Mock icons
jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon">👁️</span>,
  EyeOff: () => <span data-testid="eye-off-icon">👁️‍🗨️</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✅</span>,
  XCircle: () => <span data-testid="x-circle-icon">❌</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">⚠️</span>,
}))

describe('Form Components', () => {
  describe('FormField', () => {
    it('renders label when provided', () => {
      render(
        <FormField label="Test Label">
          <input type="text" />
        </FormField>
      )
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('shows required indicator when required is true', () => {
      render(
        <FormField label="Test Label" required>
          <input type="text" />
        </FormField>
      )
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('displays error message when error is provided', () => {
      render(
        <FormField label="Test Label" error="This field is required">
          <input type="text" />
        </FormField>
      )
      expect(screen.getByText('This field is required')).toBeInTheDocument()
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument()
    })

    it('displays helper text when helperText is provided', () => {
      render(
        <FormField label="Test Label" helperText="This is helpful information">
          <input type="text" />
        </FormField>
      )
      expect(screen.getByText('This is helpful information')).toBeInTheDocument()
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <FormField label="Test Label" className="custom-class">
          <input type="text" />
        </FormField>
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Input', () => {
    it('renders with default props', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<Input label="Email" placeholder="Enter email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('handles password visibility toggle', async () => {
      const user = userEvent.setup()
      render(<Input type="password" placeholder="Enter password" />)
      
      const input = screen.getByPlaceholderText('Enter password')
      const toggleButton = screen.getByRole('button')
      
      expect(input).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('applies different sizes', () => {
      const { rerender } = render(<Input inputSize="sm" placeholder="Small input" />)
      let input = screen.getByPlaceholderText('Small input')
      expect(input).toHaveClass('px-3 py-1.5 text-sm')
      
      rerender(<Input inputSize="lg" placeholder="Large input" />)
      input = screen.getByPlaceholderText('Large input')
      expect(input).toHaveClass('px-4 py-3 text-base')
    })

    it('applies different variants', () => {
      const { rerender } = render(<Input variant="filled" placeholder="Filled input" />)
      let input = screen.getByPlaceholderText('Filled input')
      expect(input).toHaveClass('bg-gray-50')
      
      rerender(<Input variant="outlined" placeholder="Outlined input" />)
      input = screen.getByPlaceholderText('Outlined input')
      expect(input).toHaveClass('border-2')
    })

    it('shows error styling when error is provided', () => {
      render(<Input error="Invalid input" placeholder="Error input" />)
      const input = screen.getByPlaceholderText('Error input')
      expect(input).toHaveClass('border-red-500')
    })

    it('handles left and right icons', () => {
      render(
        <Input 
          leftIcon={<span data-testid="left-icon">🔍</span>}
          rightIcon={<span data-testid="right-icon">✅</span>}
          placeholder="Icon input"
        />
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} placeholder="Ref input" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('TextArea', () => {
    it('renders with default props', () => {
      render(<TextArea placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<TextArea label="Description" placeholder="Enter description" />)
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('applies different sizes', () => {
      const { rerender } = render(<TextArea textAreaSize="sm" placeholder="Small textarea" />)
      let textarea = screen.getByPlaceholderText('Small textarea')
      expect(textarea).toHaveClass('px-3 py-1.5 text-sm')
      
      rerender(<TextArea textAreaSize="lg" placeholder="Large textarea" />)
      textarea = screen.getByPlaceholderText('Large textarea')
      expect(textarea).toHaveClass('px-4 py-3 text-base')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<TextArea ref={ref} placeholder="Ref textarea" />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })
  })

  describe('Select', () => {
    const mockOptions = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3', disabled: true }
    ]

    it('renders with options', () => {
      render(<Select options={mockOptions} placeholder="Select option" />)
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<Select label="Choose option" options={mockOptions} />)
      expect(screen.getByText('Choose option')).toBeInTheDocument()
    })

    it('handles selection change', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Select options={mockOptions} onChange={handleChange} />)
      
      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'option2')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('applies different sizes', () => {
      const { rerender } = render(<Select selectSize="sm" options={mockOptions} />)
      let select = screen.getByRole('combobox')
      expect(select).toHaveClass('px-3 py-1.5 text-sm')
      
      rerender(<Select selectSize="lg" options={mockOptions} />)
      select = screen.getByRole('combobox')
      expect(select).toHaveClass('px-4 py-3 text-base')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSelectElement>()
      render(<Select ref={ref} options={mockOptions} />)
      expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    })
  })

  describe('Checkbox', () => {
    it('renders with label', () => {
      render(<Checkbox label="Accept terms" />)
      // Checkbox has two labels - one from FormField and one inline
      expect(screen.getAllByText('Accept terms')).toHaveLength(2)
    })

    it('handles change events', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Checkbox label="Accept terms" onChange={handleChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('applies different sizes', () => {
      const { rerender } = render(<Checkbox checkboxSize="sm" label="Small checkbox" />)
      let checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('h-4 w-4')
      
      rerender(<Checkbox checkboxSize="lg" label="Large checkbox" />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('h-6 w-6')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Checkbox ref={ref} label="Ref checkbox" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('Radio', () => {
    it('renders with label', () => {
      render(<Radio label="Option A" name="test" value="a" />)
      // Radio has two labels - one from FormField and one inline
      expect(screen.getAllByText('Option A')).toHaveLength(2)
    })

    it('handles change events', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Radio label="Option A" name="test" value="a" onChange={handleChange} />)
      
      const radio = screen.getByRole('radio')
      await user.click(radio)
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('applies different sizes', () => {
      const { rerender } = render(<Radio radioSize="sm" label="Small radio" name="test" value="a" />)
      let radio = screen.getByRole('radio')
      expect(radio).toHaveClass('h-4 w-4')
      
      rerender(<Radio radioSize="lg" label="Large radio" name="test" value="a" />)
      radio = screen.getByRole('radio')
      expect(radio).toHaveClass('h-6 w-6')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Radio ref={ref} label="Ref radio" name="test" value="a" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('Validation Functions', () => {
    describe('validateEmail', () => {
      it('returns null for valid email', () => {
        expect(validateEmail('test@example.com')).toBeNull()
        expect(validateEmail('user.name+tag@domain.co.uk')).toBeNull()
      })

      it('returns error for invalid email', () => {
        expect(validateEmail('')).toBe('Email is required')
        expect(validateEmail('invalid-email')).toBe('Please enter a valid email address')
        expect(validateEmail('test@')).toBe('Please enter a valid email address')
        expect(validateEmail('@example.com')).toBe('Please enter a valid email address')
      })
    })

    describe('validatePassword', () => {
      it('returns null for valid password', () => {
        expect(validatePassword('password123')).toBeNull()
        expect(validatePassword('123456')).toBeNull()
      })

      it('returns error for invalid password', () => {
        expect(validatePassword('')).toBe('Password is required')
        expect(validatePassword('12345')).toBe('Password must be at least 6 characters')
      })
    })

    describe('validatePhone', () => {
      it('returns null for valid phone numbers', () => {
        expect(validatePhone('+1234567890')).toBeNull()
        expect(validatePhone('1234567890')).toBeNull()
        expect(validatePhone('+1 234 567 890')).toBeNull()
      })

      it('returns error for invalid phone numbers', () => {
        expect(validatePhone('')).toBe('Phone number is required')
        expect(validatePhone('abc')).toBe('Please enter a valid phone number')
        expect(validatePhone('0123')).toBe('Please enter a valid phone number') // Starts with 0, invalid
        expect(validatePhone('+0123')).toBe('Please enter a valid phone number') // Starts with +0, invalid
      })
    })

    describe('validateRequired', () => {
      it('returns null for non-empty values', () => {
        expect(validateRequired('test', 'Field')).toBeNull()
        expect(validateRequired('  test  ', 'Field')).toBeNull()
      })

      it('returns error for empty values', () => {
        expect(validateRequired('', 'Field')).toBe('Field is required')
        expect(validateRequired('   ', 'Field')).toBe('Field is required')
      })
    })
  })
})
