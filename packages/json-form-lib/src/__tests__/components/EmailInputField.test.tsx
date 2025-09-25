import { fireEvent, render } from '@testing-library/react-native';
import { EmailInputField } from '../../components/fields/EmailInputField';
import type { FieldComponentProps, RenderContext, TextField } from '../../types';

describe('EmailInputField', () => {
  const mockContext: RenderContext = {
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    disabled: false,
    isValid: true,
    isDirty: false
  };

  const createMockProps = (fieldOverrides: Partial<TextField> = {}): FieldComponentProps => ({
    field: {
      field: {
        id: 'email-field',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter email',
        ...fieldOverrides
      },
      _parsed: {
        dependencies: [],
        conditionalRules: [],
        validationSchema: undefined
      }
    },
    value: '',
    error: [],
    touched: false,
    disabled: false,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    onFocus: jest.fn(),
    context: mockContext
  });

  it('should render email input field', () => {
    const props = createMockProps();
    const { getByTestId } = render(<EmailInputField {...props} />);

    expect(getByTestId('email-input-email-field')).toBeTruthy();
  });

  it('should display placeholder text', () => {
    const props = createMockProps({ placeholder: 'Enter your email' });
    const { getByPlaceholderText } = render(<EmailInputField {...props} />);

    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('should display current value', () => {
    const props = createMockProps();
    props.value = 'user@example.com';
    
    const { getByDisplayValue } = render(<EmailInputField {...props} />);

    expect(getByDisplayValue('user@example.com')).toBeTruthy();
  });

  it('should call onChange when text changes', () => {
    const props = createMockProps();
    const { getByTestId } = render(<EmailInputField {...props} />);

    const input = getByTestId('email-input-email-field');
    fireEvent.changeText(input, 'user@example.com');

    expect(props.onChange).toHaveBeenCalledWith('user@example.com');
  });

  it('should call onFocus when input is focused', () => {
    const props = createMockProps();
    const { getByTestId } = render(<EmailInputField {...props} />);

    const input = getByTestId('email-input-email-field');
    fireEvent(input, 'focus');

    expect(props.onFocus).toHaveBeenCalled();
  });

  it('should call onBlur when input loses focus', () => {
    const props = createMockProps();
    const { getByTestId } = render(<EmailInputField {...props} />);

    const input = getByTestId('email-input-email-field');
    fireEvent(input, 'blur');

    expect(props.onBlur).toHaveBeenCalled();
  });

  describe('Email-specific Configuration', () => {
    it('should use email keyboard type', () => {
      const props = createMockProps();
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should disable auto-capitalize', () => {
      const props = createMockProps();
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('should disable auto-correct', () => {
      const props = createMockProps();
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.autoCorrect).toBe(false);
    });

    it('should convert input to lowercase', () => {
      const props = createMockProps();
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      fireEvent.changeText(input, 'USER@EXAMPLE.COM');

      expect(props.onChange).toHaveBeenCalledWith('user@example.com');
    });

    it('should trim whitespace from input', () => {
      const props = createMockProps();
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      fireEvent.changeText(input, '  user@example.com  ');

      expect(props.onChange).toHaveBeenCalledWith('user@example.com');
    });
  });

  describe('Email Validation', () => {
    it('should show valid indicator for valid email', () => {
      const props = createMockProps();
      props.value = 'user@example.com';
      
      const { getByText } = render(<EmailInputField {...props} />);

      expect(getByText('✓')).toBeTruthy();
    });

    it('should show invalid indicator for invalid email', () => {
      const props = createMockProps();
      props.value = 'invalid-email';
      
      const { getByText } = render(<EmailInputField {...props} />);

      expect(getByText('✗')).toBeTruthy();
    });

    it('should not show indicator for empty email', () => {
      const props = createMockProps();
      props.value = '';
      
      const { queryByText } = render(<EmailInputField {...props} />);

      expect(queryByText('✓')).toBeFalsy();
      expect(queryByText('✗')).toBeFalsy();
    });

    it('should validate various email formats correctly', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.co'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user@com',
        'user name@example.com'
      ];

      validEmails.forEach(email => {
        const props = createMockProps();
        props.value = email;
        
        const { getByText } = render(<EmailInputField {...props} />);
        expect(getByText('✓')).toBeTruthy();
      });

      invalidEmails.forEach(email => {
        const props = createMockProps();
        props.value = email;
        
        const { getByText } = render(<EmailInputField {...props} />);
        expect(getByText('✗')).toBeTruthy();
      });
    });
  });

  describe('Email Suggestions', () => {
    it('should suggest common domain corrections', () => {
      const props = createMockProps();
      props.value = 'user@gmailcom'; // missing dot, should be invalid and trigger suggestion
      
      const { getByText } = render(<EmailInputField {...props} />);

      expect(getByText('Did you mean:')).toBeTruthy();
      expect(getByText('user@gmail.com')).toBeTruthy();
    });

    it('should apply suggestion when pressed', () => {
      const props = createMockProps();
      props.value = 'user@gmailcom';
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const suggestion = getByTestId('email-suggestion-email-field');
      fireEvent.press(suggestion);

      expect(props.onChange).toHaveBeenCalledWith('user@gmail.com');
    });

    it('should not show suggestions for valid emails', () => {
      const props = createMockProps();
      props.value = 'user@gmail.com';
      
      const { queryByText } = render(<EmailInputField {...props} />);

      expect(queryByText('Did you mean:')).toBeFalsy();
    });

    it('should show format help for invalid emails without suggestions', () => {
      const props = createMockProps();
      props.value = 'completely-invalid';
      
      const { getByText } = render(<EmailInputField {...props} />);

      expect(getByText('Please enter a valid email address (e.g., user@example.com)')).toBeTruthy();
    });
  });

  describe('Max Length', () => {
    it('should apply maxLength constraint', () => {
      const props = createMockProps({ maxLength: 50 });
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.maxLength).toBe(50);
    });

    it('should prevent input beyond maxLength', () => {
      const props = createMockProps({ maxLength: 10 });
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      fireEvent.changeText(input, 'verylongemail@example.com'); // Much longer than 10 chars

      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should allow input within maxLength', () => {
      const props = createMockProps({ maxLength: 50 });
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      fireEvent.changeText(input, 'user@example.com'); // Within limit

      expect(props.onChange).toHaveBeenCalledWith('user@example.com');
    });

    it('should display character count when maxLength is set', () => {
      const props = createMockProps({ maxLength: 50 });
      props.value = 'user@example.com';
      
      const { getByText } = render(<EmailInputField {...props} />);

      expect(getByText('16/50')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const props = createMockProps();
      props.disabled = true;
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.editable).toBe(false);
    });

    it('should disable input when field is disabled', () => {
      const props = createMockProps({ disabled: true });
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.editable).toBe(false);
    });

    it('should enable input when not disabled', () => {
      const props = createMockProps();
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.editable).toBe(true);
    });
  });

  describe('Readonly State', () => {
    it('should disable input when field is readonly', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.editable).toBe(false);
    });

    it('should apply readonly background color', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.style.backgroundColor).toBe('#f9fafb');
    });
  });

  describe('Error State', () => {
    it('should apply error border color when field has errors and is touched', () => {
      const props = createMockProps();
      props.error = ['Email is required'];
      props.touched = true;
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.style.borderColor).toBe('#ef4444');
    });

    it('should not apply error border color when field has errors but is not touched', () => {
      const props = createMockProps();
      props.error = ['Email is required'];
      props.touched = false;
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });

    it('should not apply error border color when field is touched but has no errors', () => {
      const props = createMockProps();
      props.error = [];
      props.touched = true;
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });
  });

  describe('Accessibility', () => {
    it('should provide correct accessibility attributes', () => {
      const props = createMockProps({
        label: 'Email Address',
        description: 'Enter your email address'
      });
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.accessibilityLabel).toBe('Email Address');
      expect(input.props.accessibilityHint).toBe('Enter your email address');
    });

    it('should provide email-specific accessibility attributes', () => {
      const props = createMockProps();
      const { getByTestId } = render(<EmailInputField {...props} />);

      const input = getByTestId('email-input-email-field');
      expect(input.props.textContentType).toBe('emailAddress');
      expect(input.props.autoComplete).toBe('email');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should provide accessibility labels for validation indicators', () => {
      const props = createMockProps();
      props.value = 'user@example.com';
      
      const { getByText } = render(<EmailInputField {...props} />);

      const validIndicator = getByText('✓');
      expect(validIndicator.props.accessibilityLabel).toBe('Valid email format');
    });

    it('should provide accessibility labels for invalid indicators', () => {
      const props = createMockProps();
      props.value = 'invalid-email';
      
      const { getByText } = render(<EmailInputField {...props} />);

      const invalidIndicator = getByText('✗');
      expect(invalidIndicator.props.accessibilityLabel).toBe('Invalid email format');
    });

    it('should provide accessibility labels for suggestions', () => {
      const props = createMockProps();
      props.value = 'user@gmailcom';
      
      const { getByTestId } = render(<EmailInputField {...props} />);

      const suggestion = getByTestId('email-suggestion-email-field');
      expect(suggestion.props.accessibilityLabel).toBe('Use suggested email: user@gmail.com');
      expect(suggestion.props.accessibilityRole).toBe('button');
    });
  });
});