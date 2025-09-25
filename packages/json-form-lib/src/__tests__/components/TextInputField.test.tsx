import { fireEvent, render } from '@testing-library/react-native';
import { TextInputField } from '../../components/fields/TextInputField';
import type { FieldComponentProps, RenderContext, TextField } from '../../types';

describe('TextInputField', () => {
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
        id: 'test-field',
        type: 'text',
        label: 'Test Field',
        placeholder: 'Enter text',
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

  it('should render text input field', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextInputField {...props} />);

    expect(getByTestId('text-input-test-field')).toBeTruthy();
  });

  it('should display placeholder text', () => {
    const props = createMockProps({ placeholder: 'Enter your name' });
    const { getByPlaceholderText } = render(<TextInputField {...props} />);

    expect(getByPlaceholderText('Enter your name')).toBeTruthy();
  });

  it('should display current value', () => {
    const props = createMockProps();
    props.value = 'Current Value';
    
    const { getByDisplayValue } = render(<TextInputField {...props} />);

    expect(getByDisplayValue('Current Value')).toBeTruthy();
  });

  it('should call onChange when text changes', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextInputField {...props} />);

    const input = getByTestId('text-input-test-field');
    fireEvent.changeText(input, 'new value');

    expect(props.onChange).toHaveBeenCalledWith('new value');
  });

  it('should call onFocus when input is focused', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextInputField {...props} />);

    const input = getByTestId('text-input-test-field');
    fireEvent(input, 'focus');

    expect(props.onFocus).toHaveBeenCalled();
  });

  it('should call onBlur when input loses focus', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextInputField {...props} />);

    const input = getByTestId('text-input-test-field');
    fireEvent(input, 'blur');

    expect(props.onBlur).toHaveBeenCalled();
  });

  describe('Basic Text Field', () => {
    it('should use default keyboard for text fields', () => {
      const props = createMockProps({ type: 'text' });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.keyboardType).toBe('default');
    });

    it('should use sentences for text fields by default', () => {
      const props = createMockProps({ type: 'text' });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.autoCapitalize).toBe('sentences');
    });

    it('should use custom autoCapitalize when specified', () => {
      const props = createMockProps({ 
        type: 'text',
        autoCapitalize: 'words'
      });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.autoCapitalize).toBe('words');
    });

    it('should enable auto-correct for text fields by default', () => {
      const props = createMockProps({ type: 'text' });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.autoCorrect).toBe(true);
    });

    it('should respect custom autoCorrect setting', () => {
      const props = createMockProps({ 
        type: 'text',
        autoCorrect: false
      });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.autoCorrect).toBe(false);
    });
  });

  describe('Max Length', () => {
    it('should apply maxLength constraint', () => {
      const props = createMockProps({ maxLength: 10 });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.maxLength).toBe(10);
    });

    it('should prevent input beyond maxLength', () => {
      const props = createMockProps({ maxLength: 5 });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      fireEvent.changeText(input, '123456'); // 6 characters, should be truncated

      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should allow input within maxLength', () => {
      const props = createMockProps({ maxLength: 10 });
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      fireEvent.changeText(input, '12345'); // 5 characters, should be allowed

      expect(props.onChange).toHaveBeenCalledWith('12345');
    });

    it('should display character count when maxLength is set', () => {
      const props = createMockProps({ maxLength: 10 });
      props.value = 'hello';
      
      const { getByText } = render(<TextInputField {...props} />);

      expect(getByText('5/10')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const props = createMockProps();
      props.disabled = true;
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.editable).toBe(false);
    });

    it('should disable input when field is disabled', () => {
      const props = createMockProps({ disabled: true });
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.editable).toBe(false);
    });

    it('should enable input when not disabled', () => {
      const props = createMockProps();
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.editable).toBe(true);
    });
  });

  describe('Readonly State', () => {
    it('should disable input when field is readonly', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.editable).toBe(false);
    });

    it('should apply readonly background color', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.style.backgroundColor).toBe('#f9fafb');
    });
  });

  describe('Error State', () => {
    it('should apply error border color when field has errors and is touched', () => {
      const props = createMockProps();
      props.error = ['This field is required'];
      props.touched = true;
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.style.borderColor).toBe('#ef4444');
    });

    it('should not apply error border color when field has errors but is not touched', () => {
      const props = createMockProps();
      props.error = ['This field is required'];
      props.touched = false;
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });

    it('should not apply error border color when field is touched but has no errors', () => {
      const props = createMockProps();
      props.error = [];
      props.touched = true;
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });
  });

  describe('Accessibility', () => {
    it('should provide correct accessibility attributes', () => {
      const props = createMockProps({
        label: 'Username',
        description: 'Enter your username'
      });
      
      const { getByTestId } = render(<TextInputField {...props} />);

      const input = getByTestId('text-input-test-field');
      expect(input.props.accessibilityLabel).toBe('Username');
      expect(input.props.accessibilityHint).toBe('Enter your username');
    });
  });
});