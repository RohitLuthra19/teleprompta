import React from 'react';
import { Text, View } from 'react-native';
import type {
    FieldComponent,
    FieldComponentProps,
    FieldType,
    FieldRenderer as IFieldRenderer,
    ParsedField,
    RenderContext
} from './types';

/**
 * Field Type Registry - Manages field component registration and resolution
 */
class FieldTypeRegistry {
  private components: Map<string, FieldComponent> = new Map();

  /**
   * Register a field component for a specific field type
   */
  register(type: FieldType, component: FieldComponent): void {
    this.components.set(type, component);
  }

  /**
   * Get a field component for a specific field type
   */
  get(type: FieldType): FieldComponent | undefined {
    return this.components.get(type);
  }

  /**
   * Check if a field type is registered
   */
  has(type: FieldType): boolean {
    return this.components.has(type);
  }

  /**
   * Get all registered field types
   */
  getRegisteredTypes(): FieldType[] {
    return Array.from(this.components.keys()) as FieldType[];
  }

  /**
   * Unregister a field type
   */
  unregister(type: FieldType): boolean {
    return this.components.delete(type);
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
  }
}

/**
 * Default fallback component for unsupported field types
 */
const UnsupportedFieldComponent: FieldComponent = ({ field }) => (
  <View
    style={{
      padding: 12,
      backgroundColor: '#fff3cd',
      borderColor: '#ffeaa7',
      borderWidth: 1,
      borderRadius: 6,
      marginVertical: 4
    }}
    accessibilityRole="alert"
    accessibilityLabel={`Unsupported field type: ${field.field.type}`}
  >
    <Text
      style={{
        color: '#856404',
        fontSize: 14,
        fontWeight: '500'
      }}
    >
      Field type "{field.field.type}" is not supported
    </Text>
    <Text
      style={{
        color: '#856404',
        fontSize: 12,
        marginTop: 4
      }}
    >
      Field ID: {field.field.id}
    </Text>
  </View>
);

/**
 * Error boundary component for field rendering errors
 */
interface FieldErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class FieldErrorBoundary extends React.Component<
  { children: React.ReactNode; fieldId: string },
  FieldErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fieldId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FieldErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Field rendering error for field ${this.props.fieldId}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            padding: 12,
            backgroundColor: '#f8d7da',
            borderColor: '#f5c6cb',
            borderWidth: 1,
            borderRadius: 6,
            marginVertical: 4
          }}
          accessibilityRole="alert"
          accessibilityLabel={`Error rendering field: ${this.props.fieldId}`}
        >
          <Text
            style={{
              color: '#721c24',
              fontSize: 14,
              fontWeight: '500'
            }}
          >
            Error rendering field
          </Text>
          <Text
            style={{
              color: '#721c24',
              fontSize: 12,
              marginTop: 4
            }}
          >
            Field ID: {this.props.fieldId}
          </Text>
          {__DEV__ && this.state.error && (
            <Text
              style={{
                color: '#721c24',
                fontSize: 10,
                marginTop: 4,
                fontFamily: 'monospace'
              }}
            >
              {this.state.error.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Field Renderer Implementation
 * Handles rendering of form fields with pluggable architecture
 */
export class FieldRenderer implements IFieldRenderer {
  private registry: FieldTypeRegistry;

  constructor() {
    this.registry = new FieldTypeRegistry();
  }

  /**
   * Register a field component for a specific field type
   */
  registerFieldType(type: string, component: FieldComponent): void {
    this.registry.register(type as FieldType, component);
  }

  /**
   * Get a field component for a specific field type
   */
  getFieldComponent(type: string): FieldComponent | undefined {
    return this.registry.get(type as FieldType);
  }

  /**
   * Check if a field type is supported
   */
  isFieldTypeSupported(type: string): boolean {
    return this.registry.has(type as FieldType);
  }

  /**
   * Get all registered field types
   */
  getRegisteredFieldTypes(): string[] {
    return this.registry.getRegisteredTypes();
  }

  /**
   * Render a field with error boundary and accessibility features
   */
  render(field: ParsedField, context: RenderContext): React.ReactElement {
    const fieldType = field.field.type;
    const FieldComponent = this.registry.get(fieldType) || UnsupportedFieldComponent;

    // Prepare field props
    const fieldProps: FieldComponentProps = {
      field,
      value: context.values[field.field.id] ?? field.field.defaultValue ?? '',
      error: context.errors[field.field.id],
      touched: context.touched[field.field.id] || false,
      disabled: context.disabled || field.field.disabled || false,
      onChange: (value: any) => {
        context.onChange?.(field.field.id, value);
      },
      onBlur: () => {
        context.onBlur?.(field.field.id);
      },
      onFocus: () => {
        context.onFocus?.(field.field.id);
      },
      context
    };

    return (
      <FieldErrorBoundary key={field.field.id} fieldId={field.field.id}>
        <FieldComponent {...fieldProps} />
      </FieldErrorBoundary>
    );
  }

  /**
   * Render multiple fields
   */
  renderFields(fields: ParsedField[], context: RenderContext): React.ReactElement[] {
    return fields.map(field => this.render(field, context));
  }

  /**
   * Clear all registered field types
   */
  clearRegistry(): void {
    this.registry.clear();
  }
}

// Create a singleton instance for global use
export const fieldRenderer = new FieldRenderer();

// Export the registry for direct access if needed
export { FieldTypeRegistry };
