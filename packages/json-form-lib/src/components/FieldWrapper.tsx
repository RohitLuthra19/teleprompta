import * as React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import type { BaseField } from '../types';

export interface FieldWrapperProps {
  field: BaseField;
  error?: string[];
  touched: boolean;
  disabled: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * FieldWrapper provides common field functionality including:
 * - Field labels with required indicators
 * - Field descriptions
 * - Error message display
 * - Accessibility attributes
 * - Consistent styling and spacing
 */
export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  field,
  error,
  touched,
  disabled,
  children,
  style,
  testID
}) => {
  const hasError = error && error.length > 0 && touched;
  const isRequired = field.required;

  // Generate accessibility attributes
  const accessibilityProps = {
    accessibilityLabel: field.label,
    accessibilityHint: field.description,
    accessibilityRequired: isRequired,
    accessibilityInvalid: hasError,
    testID: testID || `field-${field.id}`
  };

  return (
    <View
      style={[
        {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1
        },
        field.style,
        style
      ]}
      {...accessibilityProps}
    >
      {/* Field Label */}
      <View style={{ marginBottom: 6 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: isRequired ? '600' : '500',
            color: disabled ? '#9ca3af' : '#374151',
            marginBottom: 2
          }}
          accessibilityRole="text"
        >
          {field.label}
          {isRequired && (
            <Text
              style={{
                color: '#ef4444',
                marginLeft: 2
              }}
              accessibilityLabel="required"
            >
              {' *'}
            </Text>
          )}
        </Text>

        {/* Field Description */}
        {field.description && (
          <Text
            style={{
              fontSize: 14,
              color: disabled ? '#9ca3af' : '#6b7280',
              lineHeight: 20
            }}
            accessibilityRole="text"
          >
            {field.description}
          </Text>
        )}
      </View>

      {/* Field Input Component */}
      <View>
        {children}
      </View>

      {/* Error Messages */}
      {hasError && (
        <View
          style={{
            marginTop: 6
          }}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error.map((errorMessage, index) => (
            <Text
              key={index}
              style={{
                fontSize: 14,
                color: '#ef4444',
                lineHeight: 20,
                marginBottom: index < error.length - 1 ? 2 : 0
              }}
              accessibilityRole="text"
            >
              {errorMessage}
            </Text>
          ))}
        </View>
      )}

      {/* Readonly Indicator */}
      {field.readonly && (
        <View
          style={{
            marginTop: 4
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: '#6b7280',
              fontStyle: 'italic'
            }}
            accessibilityRole="text"
          >
            Read-only
          </Text>
        </View>
      )}
    </View>
  );
};

FieldWrapper.displayName = 'FieldWrapper';