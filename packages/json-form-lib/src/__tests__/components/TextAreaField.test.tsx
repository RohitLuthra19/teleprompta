import { fireEvent, render } from '@testing-library/react-native';
import { TextAreaField } from '../../components/fields/TextAreaField';
import type { FieldComponentProps, RenderContext, TextAreaField as TextAreaFieldType } from '../../types';

describe('TextAreaField', () => {
  const mockContext: RenderContext = {
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    disabled: false,
    isValid: true,
    isDirty: false,
    hasSubmitted: false
  };

  const createMockProps = (fieldOverrides: Partial<TextAreaFieldType> = {}): FieldComponentProps => ({
    field: {
      field: {
        id: 'textarea-field',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter description',
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

  it('should render textarea field', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextAreaField {...props} />);

    expect(getByTestId('textarea-textarea-field')).toBeTruthy();
  });

  it('should display placeholder text', () => {
    const props = createMockProps({ placeholder: 'Enter your description' });
    const { getByPlaceholderText } = render(<TextAreaField {...props} />);

    expect(getByPlaceholderText('Enter your description')).toBeTruthy();
  });

  it('should display current value', () => {
    const props = createMockProps();
    props.value = 'This is a description';
    
    const { getByDisplayValue } = render(<TextAreaField {...props} />);

    expect(getByDisplayValue('This is a description')).toBeTruthy();
  });

  it('should call onChange when text changes', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextAreaField {...props} />);

    const input = getByTestId('textarea-textarea-field');
    fireEvent.changeText(input, 'New description');

    expect(props.onChange).toHaveBeenCalledWith('New description');
  });

  it('should call onFocus when input is focused', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextAreaField {...props} />);

    const input = getByTestId('textarea-textarea-field');
    fireEvent(input, 'focus');

    expect(props.onFocus).toHaveBeenCalled();
  });

  it('should call onBlur when input loses focus', () => {
    const props = createMockProps();
    const { getByTestId } = render(<TextAreaField {...props} />);

    const input = getByTestId('textarea-textarea-field');
    fireEvent(input, 'blur');

    expect(props.onBlur).toHaveBeenCalled();
  });

  describe('Multiline Configuration', () => {
    it('should enable multiline input', () => {
      const props = createMockProps();
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.multiline).toBe(true);
    });

    it('should use default number of rows (4)', () => {
      const props = createMockProps();
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.numberOfLines).toBe(4);
    });

    it('should use custom number of rows', () => {
      const props = createMockProps({ rows: 6 });
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.numberOfLines).toBe(6);
    });

    it('should align text to top', () => {
      const props = createMockProps();
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.style.textAlignVertical).toBe('top');
    });
  });

  describe('Text Statistics', () => {
    it('should display word count for non-empty text', () => {
      const props = createMockProps();
      props.value = 'This is a test description with multiple words';
      
      const { getByText } = render(<TextAreaField {...props} />);

      expect(getByText('8 words')).toBeTruthy(); // "This is a test description with multiple words" = 8 words
    });

    it('should display line count', () => {
      const props = createMockProps();
      props.value = 'Line 1\nLine 2\nLine 3';
      
      const { getByText } = render(<TextAreaField {...props} />);

      expect(getByText('3 lines')).toBeTruthy();
    });

    it('should display paragraph count for multiple paragraphs', () => {
      const props = createMockProps();
      props.value = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
      
      const { getByText } = render(<TextAreaField {...props} />);

      expect(getByText('3 paragraphs')).toBeTruthy();
    });

    it('should not display statistics for empty text', () => {
      const props = createMockProps();
      props.value = '';
      
      const { queryByText } = render(<TextAreaField {...props} />);

      expect(queryByText(/words/)).toBeFalsy();
      expect(queryByText(/lines/)).toBeFalsy();
    });

    it('should handle single word correctly', () => {
      const props = createMockProps();
      props.value = 'Hello';
      
      const { getByText } = render(<TextAreaField {...props} />);

      expect(getByText('1 words')).toBeTruthy();
      expect(getByText('1 lines')).toBeTruthy();
    });

    it('should not show paragraph count for single paragraph', () => {
      const props = createMockProps();
      props.value = 'This is a single paragraph';
      
      const { queryByText } = render(<TextAreaField {...props} />);

      expect(queryByText(/paragraphs/)).toBeFalsy();
    });
  });

  describe('Auto-grow Feature', () => {
    it('should show auto-grow indicator when enabled', () => {
      const props = createMockProps({ autoGrow: true });
      
      const { getByText } = render(<TextAreaField {...props} />);

      expect(getByText('Auto-grow')).toBeTruthy();
    });

    it('should not show auto-grow indicator when disabled', () => {
      const props = createMockProps({ autoGrow: false });
      
      const { queryByText } = render(<TextAreaField {...props} />);

      expect(queryByText('Auto-grow')).toBeFalsy();
    });

    it('should handle content size change for auto-grow', () => {
      const props = createMockProps({ autoGrow: true });
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      
      // Simulate content size change
      fireEvent(input, 'contentSizeChange', {
        nativeEvent: {
          contentSize: { height: 120 }
        }
      });

      // The component should handle the height change internally
      expect(input).toBeTruthy();
    });
  });

  describe('Max Length', () => {
    it('should apply maxLength constraint', () => {
      const props = createMockProps({ maxLength: 100 });
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.maxLength).toBe(100);
    });

    it('should prevent input beyond maxLength', () => {
      const props = createMockProps({ maxLength: 10 });
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      fireEvent.changeText(input, 'This is a very long text that exceeds the limit');

      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('should allow input within maxLength', () => {
      const props = createMockProps({ maxLength: 50 });
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      fireEvent.changeText(input, 'Short text');

      expect(props.onChange).toHaveBeenCalledWith('Short text');
    });

    it('should display character count when maxLength is set', () => {
      const props = createMockProps({ maxLength: 100 });
      props.value = 'Hello world';
      
      const { getByText } = render(<TextAreaField {...props} />);

      expect(getByText('11/100')).toBeTruthy();
    });

    it('should highlight character count when approaching limit', () => {
      const props = createMockProps({ maxLength: 10 });
      props.value = '123456789'; // 9 characters, 90% of limit
      
      const { getByText } = render(<TextAreaField {...props} />);

      const countText = getByText('9/10');
      expect(countText.props.style.color).toBe('#ef4444'); // Red color for warning
    });
  });

  describe('Min Length Validation', () => {
    it('should show warning when text is below minimum length', () => {
      const props = createMockProps({ minLength: 20 });
      props.value = 'Short text';
      
      const { getByText } = render(<TextAreaField {...props} />);

      expect(getByText('Minimum 20 characters required (10 more needed)')).toBeTruthy();
    });

    it('should not show warning when text meets minimum length', () => {
      const props = createMockProps({ minLength: 10 });
      props.value = 'This text is long enough';
      
      const { queryByText } = render(<TextAreaField {...props} />);

      expect(queryByText(/Minimum.*characters required/)).toBeFalsy();
    });

    it('should not show warning for empty text', () => {
      const props = createMockProps({ minLength: 10 });
      props.value = '';
      
      const { queryByText } = render(<TextAreaField {...props} />);

      expect(queryByText(/Minimum.*characters required/)).toBeFalsy();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const props = createMockProps();
      props.disabled = true;
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.editable).toBe(false);
    });

    it('should disable input when field is disabled', () => {
      const props = createMockProps({ disabled: true });
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.editable).toBe(false);
    });

    it('should enable input when not disabled', () => {
      const props = createMockProps();
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.editable).toBe(true);
    });
  });

  describe('Readonly State', () => {
    it('should disable input when field is readonly', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.editable).toBe(false);
    });

    it('should apply readonly background color', () => {
      const props = createMockProps({ readonly: true });
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.style.backgroundColor).toBe('#f9fafb');
    });
  });

  describe('Error State', () => {
    it('should apply error border color when field has errors and is touched', () => {
      const props = createMockProps();
      props.error = ['Description is required'];
      props.touched = true;
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.style.borderColor).toBe('#ef4444');
    });

    it('should not apply error border color when field has errors but is not touched', () => {
      const props = createMockProps();
      props.error = ['Description is required'];
      props.touched = false;
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });

    it('should not apply error border color when field is touched but has no errors', () => {
      const props = createMockProps();
      props.error = [];
      props.touched = true;
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.style.borderColor).toBe('#d1d5db');
    });
  });

  describe('Accessibility', () => {
    it('should provide correct accessibility attributes', () => {
      const props = createMockProps({
        label: 'Description',
        description: 'Enter a detailed description'
      });
      
      const { getByTestId } = render(<TextAreaField {...props} />);

      const input = getByTestId('textarea-textarea-field');
      expect(input.props.accessibilityLabel).toBe('Description');
      expect(input.props.accessibilityHint).toBe('Enter a detailed description');
      expect(input.props.accessibilityRole).toBe('text');
    });

    it('should provide accessibility labels for text statistics', () => {
      const props = createMockProps();
      props.value = 'This is a test';
      
      const { getByText } = render(<TextAreaField {...props} />);

      const wordsText = getByText('4 words');
      expect(wordsText.props.accessibilityLabel).toBe('4 words');

      const linesText = getByText('1 lines');
      expect(linesText.props.accessibilityLabel).toBe('1 lines');
    });

    it('should provide accessibility label for auto-grow indicator', () => {
      const props = createMockProps({ autoGrow: true });
      
      const { getByText } = render(<TextAreaField {...props} />);

      const autoGrowText = getByText('Auto-grow');
      expect(autoGrowText.props.accessibilityLabel).toBe('Auto-expanding text area');
    });
  });
});