import { fireEvent, render } from '@testing-library/react-native';
import { PasswordInputField } from '../../components/fields/PasswordInputField';
import type { FieldComponentProps, RenderContext, TextField } from '../../types';

describe('PasswordInputField', () => {
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
        id: 'password-field',
        type: 'password',
        label: 'Password',
        placeholder: 'Enter password',
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

  it('should render password input field', () => {
    const props = createMockProps();
    const { getByTestId } = render(<PasswordInputField {...props} />);

    expect(getByTestId('password-input-password-field')).toBeTruthy();
  });

  it('should display placeholder text', () => {
    const props = createMockProps({ placeholder: 'Enter your password' });
    const { getByPlaceholderText } = render(<PasswordInputField {...props} />);

    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('should display current value', () => {
    const props = createMockProps();
    props.value = 'secret123';
    
    const { getByDisplayValue } = render(<PasswordInputField {...props} />);

    expect(getByDisplayValue('secret123')).toBeTruthy();
  });

  it('should call onChange when text changes', () => {
    const props = createMockProps();
    const { getByTestId } = render(<PasswordInputField {...props} />);

    const input = getByTestId('password-input-password-field');
    fireEvent.changeText(input, 'newpassword');

    expect(props.onChange).toHaveBeenCalledWith('newpassword');
  });

  it('should call onFocus when input is focused', () => {
    const props = createMockProps();
    const { getByTestId } = render(<PasswordInputField {...props} />);

    const input = getByTestId('password-input-password-field');
    fireEvent(input, 'focus');

    expect(props.onFocus).toHaveBeenCalled();
  });

  it('should call onBlur when input loses focus', () => {
    const props = createMockProps();
    const { getByTestId } = render(<PasswordInputField {...props} />);

    const input = getByTestId('password-input-password-field');
    fireEvent(input, 'blur');

    expect(props.onBlur).toHaveBeenCalled();
  });

  describe('Password Security', () => {
    it('should use secure text entry by default', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should disable auto-capitalize', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('should disable auto-correct', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.autoCorrect).toBe(false);
    });

    it('should use default keyboard type', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.keyboardType).toBe('default');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should render visibility toggle button', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      expect(getByTestId('password-toggle-password-field')).toBeTruthy();
    });

    it('should toggle password visibility when button is pressed', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      const toggleButton = getByTestId('password-toggle-password-field');

      // Initially secure
      expect(input.props.secureTextEntry).toBe(true);

      // Toggle to visible
      fireEvent.press(toggleButton);
      expect(input.props.secureTextEntry).toBe(false);

      // Toggle back to secure
      fireEvent.press(toggleButton);
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should not render toggle button when readonly', () => {
      const props = createMockProps({ readonly: true });
      const { queryByTestId } = render(<PasswordInputField {...props} />);

      expect(queryByTestId('password-toggle-password-field')).toBeFalsy();
    });

    it('should disable toggle button when disabled', () => {
      const props = createMockProps();
      props.disabled = true;
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const toggleButton = getByTestId('password-toggle-password-field');
      expect(toggleButton.props.disabled).toBe(true);
    });
  });

  describe('Password Strength Indicator', () => {
    it('should not show strength indicator for empty password', () => {
      const props = createMockProps();
      props.value = '';
      
      const { queryByText } = render(<PasswordInputField {...props} />);

      expect(queryByText('Weak')).toBeFalsy();
      expect(queryByText('Medium')).toBeFalsy();
      expect(queryByText('Strong')).toBeFalsy();
    });

    it('should show weak strength for simple passwords', () => {
      const props = createMockProps();
      props.value = '123';
      
      const { getByText } = render(<PasswordInputField {...props} />);

      expect(getByText('Weak')).toBeTruthy();
    });

    it('should show medium strength for moderate passwords', () => {
      const props = createMockProps();
      props.value = 'Password123';
      
      const { getByText } = render(<PasswordInputField {...props} />);

      expect(getByText('Medium')).toBeTruthy();
    });

    it('should show strong strength for complex passwords', () => {
      const props = createMockProps();
      props.value = 'MyStr0ng!P@ssw0rd';
      
      const { getByText } = render(<PasswordInputField {...props} />);

      expect(getByText('Strong')).toBeTruthy();
    });
  });

  describe('Max Length', () => {
    it('should apply maxLength constraint', () => {
      const props = createMockProps({ maxLength: 20 });
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.maxLength).toBe(20);
    });

    it('should prevent input beyond maxLength', () => {
      const props = createMockProps({ maxLength: 5 });
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      fireEvent.changeText(input, '123456'); // 6 characters, should be truncated

      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should allow input within maxLength', () => {
      const props = createMockProps({ maxLength: 10 });
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      fireEvent.changeText(input, '12345'); // 5 characters, should be allowed

      expect(props.onChange).toHaveBeenCalledWith('12345');
    });

    it('should display character count when maxLength is set', () => {
      const props = createMockProps({ maxLength: 20 });
      props.value = 'password';
      
      const { getByText } = render(<PasswordInputField {...props} />);

      expect(getByText('8/20')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const props = createMockProps();
      props.disabled = true;
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.editable).toBe(false);
    });

    it('should disable input when field is disabled', () => {
      const props = createMockProps({ disabled: true });
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.editable).toBe(false);
    });

    it('should enable input when not disabled', () => {
      const props = createMockProps();
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.editable).toBe(true);
    });
  });

  describe('Readonly State', () => {
    it('should disable input when field is readonly', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.editable).toBe(false);
    });

    it('should apply readonly background color', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.style.backgroundColor).toBe('#f9fafb');
    });
  });

  describe('Error State', () => {
    it('should apply error border color when field has errors and is touched', () => {
      const props = createMockProps();
      props.error = ['Password is required'];
      props.touched = true;
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.style.borderColor).toBe('#ef4444');
    });

    it('should not apply error border color when field has errors but is not touched', () => {
      const props = createMockProps();
      props.error = ['Password is required'];
      props.touched = false;
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });

    it('should not apply error border color when field is touched but has no errors', () => {
      const props = createMockProps();
      props.error = [];
      props.touched = true;
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });
  });

  describe('Accessibility', () => {
    it('should provide correct accessibility attributes', () => {
      const props = createMockProps({
        label: 'Password',
        description: 'Enter your password'
      });
      
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.accessibilityLabel).toBe('Password');
      expect(input.props.accessibilityHint).toBe('Enter your password');
    });

    it('should provide password-specific accessibility attributes', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const input = getByTestId('password-input-password-field');
      expect(input.props.textContentType).toBe('password');
      expect(input.props.passwordRules).toBe('minlength: 8;');
    });

    it('should provide accessibility labels for toggle button', () => {
      const props = createMockProps();
      const { getByTestId } = render(<PasswordInputField {...props} />);

      const toggleButton = getByTestId('password-toggle-password-field');
      expect(toggleButton.props.accessibilityLabel).toBe('Show password');
      expect(toggleButton.props.accessibilityRole).toBe('button');

      // Toggle and check label changes
      fireEvent.press(toggleButton);
      expect(toggleButton.props.accessibilityLabel).toBe('Hide password');
    });

    it('should provide accessibility labels for strength indicator', () => {
      const props = createMockProps();
      props.value = 'weakpass';
      
      const { getByText } = render(<PasswordInputField {...props} />);

      const strengthText = getByText('Weak');
      expect(strengthText.props.accessibilityLabel).toBe('Password strength: Weak');
    });
  });
});