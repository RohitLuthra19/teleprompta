import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FieldRenderer, fieldRenderer } from '../FieldRenderer';
import type { FieldComponent, ParsedField, RenderContext } from '../types';

// Mock field component for testing
const MockFieldComponent: FieldComponent = ({ field, value, onChange, onBlur, onFocus }) => (
  <Text
    testID={`mock-field-${field.field.id}`}
    onPress={() => onChange('test-value')}
  >
    {field.field.label}: {value}
  </Text>
);

// Another mock field component
const AnotherMockFieldComponent: FieldComponent = ({ field, value }) => (
  <Text testID={`another-mock-field-${field.field.id}`}>
    Another: {field.field.label} = {value}
  </Text>
);

describe('FieldRenderer', () => {
  let renderer: FieldRenderer;
  let mockContext: RenderContext;
  let mockField: ParsedField;

  beforeEach(() => {
    renderer = new FieldRenderer();
    
    mockContext = {
      values: { 'test-field': 'test-value' },
      errors: {},
      touched: {},
      isSubmitting: false,
      disabled: false,
      isValid: true,
      isDirty: false,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      onFocus: jest.fn()
    };

    mockField = {
      field: {
        id: 'test-field',
        type: 'text',
        label: 'Test Field',
        required: false
      },
      _parsed: {
        dependencies: [],
        conditionalRules: [],
        validationSchema: undefined
      }
    };
  });

  afterEach(() => {
    renderer.clearRegistry();
  });

  describe('Field Type Registration', () => {
    it('should register a field component', () => {
      renderer.registerFieldType('test', MockFieldComponent);
      
      expect(renderer.isFieldTypeSupported('test')).toBe(true);
      expect(renderer.getFieldComponent('test')).toBe(MockFieldComponent);
    });

    it('should return undefined for unregistered field types', () => {
      expect(renderer.getFieldComponent('nonexistent')).toBeUndefined();
      expect(renderer.isFieldTypeSupported('nonexistent')).toBe(false);
    });

    it('should get all registered field types', () => {
      renderer.registerFieldType('text', MockFieldComponent);
      renderer.registerFieldType('email', AnotherMockFieldComponent);
      
      const types = renderer.getRegisteredFieldTypes();
      expect(types).toContain('text');
      expect(types).toContain('email');
      expect(types).toHaveLength(2);
    });

    it('should clear all registered field types', () => {
      renderer.registerFieldType('text', MockFieldComponent);
      renderer.registerFieldType('email', AnotherMockFieldComponent);
      
      expect(renderer.getRegisteredFieldTypes()).toHaveLength(2);
      
      renderer.clearRegistry();
      
      expect(renderer.getRegisteredFieldTypes()).toHaveLength(0);
    });

    it('should allow overriding existing field types', () => {
      renderer.registerFieldType('text', MockFieldComponent);
      renderer.registerFieldType('text', AnotherMockFieldComponent);
      
      expect(renderer.getFieldComponent('text')).toBe(AnotherMockFieldComponent);
    });
  });

  describe('Field Rendering', () => {
    beforeEach(() => {
      renderer.registerFieldType('text', MockFieldComponent);
    });

    it('should render a registered field component', () => {
      const element = renderer.render(mockField, mockContext);
      
      const { getByTestId } = render(element);
      
      expect(getByTestId('mock-field-test-field')).toBeTruthy();
    });

    it('should pass correct props to field component', () => {
      const mockComponent = jest.fn(() => <Text>Mock</Text>);
      renderer.registerFieldType('text', mockComponent);
      
      const element = renderer.render(mockField, mockContext);
      render(element);
      
      expect(mockComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          field: mockField,
          value: 'test-value',
          error: undefined,
          touched: false,
          disabled: false,
          context: mockContext,
          onChange: expect.any(Function),
          onBlur: expect.any(Function),
          onFocus: expect.any(Function)
        }),
        {}
      );
    });

    it('should handle field with errors', () => {
      const contextWithErrors = {
        ...mockContext,
        errors: { 'test-field': ['Required field'] },
        touched: { 'test-field': true }
      };

      const mockComponent = jest.fn(() => <Text>Mock</Text>);
      renderer.registerFieldType('text', mockComponent);
      
      const element = renderer.render(mockField, contextWithErrors);
      render(element);
      
      expect(mockComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          error: ['Required field'],
          touched: true,
          onChange: expect.any(Function),
          onBlur: expect.any(Function),
          onFocus: expect.any(Function)
        }),
        {}
      );
    });

    it('should handle disabled field', () => {
      const disabledField = {
        ...mockField,
        field: { ...mockField.field, disabled: true }
      };

      const mockComponent = jest.fn(() => <Text>Mock</Text>);
      renderer.registerFieldType('text', mockComponent);
      
      const element = renderer.render(disabledField, mockContext);
      render(element);
      
      expect(mockComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
          onChange: expect.any(Function),
          onBlur: expect.any(Function),
          onFocus: expect.any(Function)
        }),
        {}
      );
    });

    it('should use default value when field value is not set', () => {
      const fieldWithDefault = {
        ...mockField,
        field: { ...mockField.field, defaultValue: 'default-value' }
      };

      const contextWithoutValue = {
        ...mockContext,
        values: {}
      };

      const mockComponent = jest.fn(() => <Text>Mock</Text>);
      renderer.registerFieldType('text', mockComponent);
      
      const element = renderer.render(fieldWithDefault, contextWithoutValue);
      render(element);
      
      expect(mockComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'default-value',
          onChange: expect.any(Function),
          onBlur: expect.any(Function),
          onFocus: expect.any(Function)
        }),
        {}
      );
    });

    it('should render unsupported field type with fallback component', () => {
      const unsupportedField = {
        ...mockField,
        field: { ...mockField.field, type: 'unsupported' as any }
      };

      const element = renderer.render(unsupportedField, mockContext);
      const { getByText } = render(element);
      
      expect(getByText('Field type "unsupported" is not supported')).toBeTruthy();
    });

    it('should connect event handlers correctly', () => {
      const element = renderer.render(mockField, mockContext);
      const { getByTestId } = render(element);
      
      fireEvent.press(getByTestId('mock-field-test-field'));
      
      expect(mockContext.onChange).toHaveBeenCalledWith('test-field', 'test-value');
    });
  });

  describe('Multiple Field Rendering', () => {
    beforeEach(() => {
      renderer.registerFieldType('text', MockFieldComponent);
      renderer.registerFieldType('email', AnotherMockFieldComponent);
    });

    it('should render multiple fields', () => {
      const fields = [
        mockField,
        {
          ...mockField,
          field: { ...mockField.field, id: 'email-field', type: 'email' as any }
        }
      ];

      const elements = renderer.renderFields(fields, mockContext);
      
      expect(elements).toHaveLength(2);
      
      const { getByTestId } = render(<>{elements}</>);
      
      expect(getByTestId('mock-field-test-field')).toBeTruthy();
      expect(getByTestId('another-mock-field-email-field')).toBeTruthy();
    });
  });

  describe('Error Boundary', () => {
    it('should catch and display field rendering errors', () => {
      const ErrorComponent: FieldComponent = () => {
        throw new Error('Test error');
      };
      
      renderer.registerFieldType('text', ErrorComponent);
      
      const element = renderer.render(mockField, mockContext);
      const { getByText } = render(element);
      
      expect(getByText('Error rendering field')).toBeTruthy();
      expect(getByText('Field ID: test-field')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should provide accessibility attributes for unsupported fields', () => {
      const unsupportedField = {
        ...mockField,
        field: { ...mockField.field, type: 'unsupported' as any }
      };

      const element = renderer.render(unsupportedField, mockContext);
      const { getByText } = render(element);
      
      const alertElement = getByText('Field type "unsupported" is not supported').parent;
      expect(alertElement.props.accessibilityRole).toBe('alert');
      expect(alertElement.props.accessibilityLabel).toBe('Unsupported field type: unsupported');
    });

    it('should provide accessibility attributes for error boundary', () => {
      const ErrorComponent: FieldComponent = () => {
        throw new Error('Test error');
      };
      
      renderer.registerFieldType('text', ErrorComponent);
      
      const element = renderer.render(mockField, mockContext);
      const { getByText } = render(element);
      
      const alertElement = getByText('Error rendering field').parent;
      expect(alertElement.props.accessibilityRole).toBe('alert');
      expect(alertElement.props.accessibilityLabel).toBe('Error rendering field: test-field');
    });
  });
});

describe('Global Field Renderer Instance', () => {
  afterEach(() => {
    fieldRenderer.clearRegistry();
  });

  it('should provide a global field renderer instance', () => {
    expect(fieldRenderer).toBeInstanceOf(FieldRenderer);
  });

  it('should maintain state across imports', () => {
    fieldRenderer.registerFieldType('global-test', MockFieldComponent);
    
    expect(fieldRenderer.isFieldTypeSupported('global-test')).toBe(true);
  });
});