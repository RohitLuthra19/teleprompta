import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldComponentProps, TextAreaField as TextAreaFieldType } from '../../types';
import { FieldWrapper } from '../FieldWrapper';

/**
 * TextAreaField component for multi-line text input
 * Integrates with Gluestack v3 styling patterns
 */
export const TextAreaField: React.FC<FieldComponentProps> = ({
  field,
  value,
  error,
  touched,
  disabled,
  onChange,
  onBlur,
  onFocus,
  context
}) => {
  const textAreaField = field.field as TextAreaFieldType;
  const hasError = error && error.length > 0 && touched;
  const isReadonly = textAreaField.readonly;
  const rows = textAreaField.rows || 4;

  // Calculate minimum height based on rows
  const minHeight = Math.max(rows * 20 + 20, 80); // 20px per row + padding

  // Input styles following Gluestack v3 patterns
  const inputStyles = {
    borderWidth: 1,
    borderColor: hasError ? '#ef4444' : (disabled ? '#d1d5db' : '#d1d5db'),
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: isReadonly ? '#f9fafb' : (disabled ? '#f3f4f6' : '#ffffff'),
    color: disabled ? '#9ca3af' : '#111827',
    minHeight,
    textAlignVertical: 'top' as const,
    // Focus styles (web only)
    ...(hasError ? {} : {
      outlineColor: 'transparent',
      outlineWidth: 0,
    })
  };

  const handleChangeText = (text: string) => {
    // Apply max length constraint
    if (textAreaField.maxLength && text.length > textAreaField.maxLength) {
      return;
    }
    
    onChange(text);
  };

  return (
    <FieldWrapper
      field={textAreaField}
      error={error}
      touched={touched}
      disabled={disabled}
      testID={`textarea-field-${textAreaField.id}`}
    >
      <View
        style={{
          position: 'relative'
        }}
      >
        <TextInput
          value={value || ''}
          onChangeText={handleChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={textAreaField.placeholder}
          multiline
          numberOfLines={rows}
          editable={!disabled && !isReadonly}
          maxLength={textAreaField.maxLength}
          style={inputStyles}
          // Accessibility props
          accessibilityLabel={textAreaField.label}
          accessibilityHint={textAreaField.description}
          // accessibilityRequired and accessibilityInvalid are not supported in React Native TextInput
          accessibilityRole="text"
          testID={`textarea-${textAreaField.id}`}
        />

        {/* Character count indicator for fields with maxLength */}
        {textAreaField.maxLength && (
          <View
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: '#6b7280',
                fontVariant: ['tabular-nums']
              }}
              accessibilityLabel={`${(value || '').length} of ${textAreaField.maxLength} characters`}
            >
              {(value || '').length}/{textAreaField.maxLength}
            </Text>
          </View>
        )}

        {/* Auto-grow indicator */}
        {textAreaField.autoGrow && (
          <View
            style={{
              position: 'absolute',
              left: 8,
              bottom: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: '#9ca3af',
                fontStyle: 'italic'
              }}
              accessibilityLabel="Auto-expanding text area"
            >
              Auto-grow
            </Text>
          </View>
        )}
      </View>
    </FieldWrapper>
  );
};

TextAreaField.displayName = 'TextAreaField';