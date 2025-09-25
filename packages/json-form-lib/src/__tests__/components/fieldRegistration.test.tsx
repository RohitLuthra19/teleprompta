import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
    getRegisteredFieldTypes,
    isFieldTypeSupported,
    registerBuiltInFieldComponents
} from '../../components/fields';
import { fieldRenderer } from '../../FieldRenderer';
import type { FieldComponent } from '../../types';

// Mock field component for testing
const MockFieldComponent: FieldComponent = ({ field }) => (
  <Text testID={`mock-${field.field.type}-${field.field.id}`}>
    Mock {field.field.type} field
  </Text>
);

describe('Field Registration System', () => {
  beforeEach(() => {
    // Clear registry before each test
    fieldRenderer.clearRegistry();
  });

  afterEach(() => {
    // Clean up after each test
    fieldRenderer.clearRegistry();
  });

  describe('registerBuiltInFieldComponents', () => {
    it('should register all built-in field components', () => {
      registerBuiltInFieldComponents();

      const registeredTypes = getRegisteredFieldTypes();
      
      // Check that basic field types are registered
      expect(registeredTypes).toContain('text');
      expect(registeredTypes).toContain('email');
      expect(registeredTypes).toContain('password');
      expect(registeredTypes).toContain('textarea');
      expect(registeredTypes).toContain('number');
    });

    it('should register text-based field types with the same component', () => {
      registerBuiltInFieldComponents();

      const textComponent = fieldRenderer.getFieldComponent('text');
      const emailComponent = fieldRenderer.getFieldComponent('email');
      const passwordComponent = fieldRenderer.getFieldComponent('password');

      // All text-based fields should use the same component
      expect(textComponent).toBe(emailComponent);
      expect(textComponent).toBe(passwordComponent);
    });

    it('should register different components for different field categories', () => {
      registerBuiltInFieldComponents();

      const textComponent = fieldRenderer.getFieldComponent('text');
      const textareaComponent = fieldRenderer.getFieldComponent('textarea');
      const numberComponent = fieldRenderer.getFieldComponent('number');

      // Different field categories should use different components
      expect(textComponent).not.toBe(textareaComponent);
      expect(textComponent).not.toBe(numberComponent);
      expect(textareaComponent).not.toBe(numberComponent);
    });

    it('should be safe to call multiple times', () => {
      registerBuiltInFieldComponents();
      const firstCallTypes = getRegisteredFieldTypes();
      
      registerBuiltInFieldComponents();
      const secondCallTypes = getRegisteredFieldTypes();

      // Should have the same types after multiple calls
      expect(firstCallTypes.sort()).toEqual(secondCallTypes.sort());
    });
  });

  describe('getRegisteredFieldTypes', () => {
    it('should return empty array when no components are registered', () => {
      const types = getRegisteredFieldTypes();
      expect(types).toEqual([]);
    });

    it('should return all registered field types', () => {
      fieldRenderer.registerFieldType('custom1', MockFieldComponent);
      fieldRenderer.registerFieldType('custom2', MockFieldComponent);

      const types = getRegisteredFieldTypes();
      
      expect(types).toContain('custom1');
      expect(types).toContain('custom2');
      expect(types).toHaveLength(2);
    });

    it('should return updated list after new registrations', () => {
      fieldRenderer.registerFieldType('initial', MockFieldComponent);
      
      let types = getRegisteredFieldTypes();
      expect(types).toEqual(['initial']);

      fieldRenderer.registerFieldType('additional', MockFieldComponent);
      
      types = getRegisteredFieldTypes();
      expect(types).toContain('initial');
      expect(types).toContain('additional');
      expect(types).toHaveLength(2);
    });
  });

  describe('isFieldTypeSupported', () => {
    it('should return false for unregistered field types', () => {
      expect(isFieldTypeSupported('nonexistent')).toBe(false);
    });

    it('should return true for registered field types', () => {
      fieldRenderer.registerFieldType('custom', MockFieldComponent);
      
      expect(isFieldTypeSupported('custom')).toBe(true);
    });

    it('should return true for built-in field types after registration', () => {
      registerBuiltInFieldComponents();
      
      expect(isFieldTypeSupported('text')).toBe(true);
      expect(isFieldTypeSupported('email')).toBe(true);
      expect(isFieldTypeSupported('password')).toBe(true);
      expect(isFieldTypeSupported('textarea')).toBe(true);
      expect(isFieldTypeSupported('number')).toBe(true);
    });

    it('should return false after field type is unregistered', () => {
      fieldRenderer.registerFieldType('temporary', MockFieldComponent);
      expect(isFieldTypeSupported('temporary')).toBe(true);

      // Clear registry (simulating unregistration)
      fieldRenderer.clearRegistry();
      expect(isFieldTypeSupported('temporary')).toBe(false);
    });
  });

  describe('Integration with FieldRenderer', () => {
    it('should work with the global field renderer instance', () => {
      // Register a custom component
      fieldRenderer.registerFieldType('integration-test', MockFieldComponent);
      
      // Verify it's accessible through the utility functions
      expect(isFieldTypeSupported('integration-test')).toBe(true);
      expect(getRegisteredFieldTypes()).toContain('integration-test');
    });

    it('should maintain consistency between direct registration and utility functions', () => {
      // Register through field renderer directly
      fieldRenderer.registerFieldType('direct', MockFieldComponent);
      
      // Register through utility function (built-ins)
      registerBuiltInFieldComponents();
      
      // Both should be accessible
      expect(isFieldTypeSupported('direct')).toBe(true);
      expect(isFieldTypeSupported('text')).toBe(true);
      
      const allTypes = getRegisteredFieldTypes();
      expect(allTypes).toContain('direct');
      expect(allTypes).toContain('text');
    });
  });

  describe('Field Component Rendering', () => {
    it('should render registered field components correctly', () => {
      registerBuiltInFieldComponents();
      
      const mockField = {
        field: {
          id: 'test-field',
          type: 'text' as const,
          label: 'Test Field'
        },
        _parsed: {
          dependencies: [],
          conditionalRules: [],
          validationSchema: undefined
        }
      };

      const mockContext = {
        values: {},
        errors: {},
        touched: {},
        isSubmitting: false,
        disabled: false,
        isValid: true,
        isDirty: false,
        hasSubmitted: false
      };

      const element = fieldRenderer.render(mockField, mockContext);
      const { getByTestId } = render(element);
      
      // Should render the TextInputField component
      expect(getByTestId('text-input-test-field')).toBeTruthy();
    });

    it('should handle unregistered field types gracefully', () => {
      // Don't register any components
      
      const mockField = {
        field: {
          id: 'test-field',
          type: 'unregistered' as any,
          label: 'Test Field'
        },
        _parsed: {
          dependencies: [],
          conditionalRules: [],
          validationSchema: undefined
        }
      };

      const mockContext = {
        values: {},
        errors: {},
        touched: {},
        isSubmitting: false,
        disabled: false,
        isValid: true,
        isDirty: false,
        hasSubmitted: false
      };

      const element = fieldRenderer.render(mockField, mockContext);
      const { getByText } = render(element);
      
      // Should render the unsupported field component
      expect(getByText('Field type "unregistered" is not supported')).toBeTruthy();
    });
  });
});