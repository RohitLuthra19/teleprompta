import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldComponentProps, TextField } from '../../types';
import { FieldWrapper } from '../FieldWrapper';

/**
 * TextInputField component for text, email, and password input fields
 * Integrates with Gluestack v3 styling patterns
 */
export const TextInputField: React.FC<FieldComponentProps> = ({
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
  const textField = field.field as TextField;
  const hasError = error && error.length > 0 && touched;
  const isReadonly = textField.readonly;

  // Determine keyboard type based on field type
  const getKeyboardType = () => {
    switch (textField.type) {
      case 'email':
        return 'email-address';
      default:
        return 'default';
    }
  };

  // Determine auto-capitalize behavior
  const getAutoCapitalize = () => {
    if (textField.autoCapitalize) {
      return textField.autoCapitalize;
    }
    
    switch (textField.type) {
      case 'email':
        return 'none';
      case 'password':
        return 'none';
      default:
        return 'sentences';
    }
  };

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
    minHeight: 44, // Accessibility minimum touch target
    // Focus styles (web only)
    ...(hasError ? {} : {
      // These would be handled by focus states in a full Gluestack implementation
      outlineColor: 'transparent',
      outlineWidth: 0,
    })
  };

  const handleChangeText = (text: string) => {
    // Apply max length constraint
    if (textField.maxLength && text.length > textField.maxLength) {
      return;
    }
    
    onChange(text);
  };

  return (
    <FieldWrapper
      field={textField}
      error={error}
      touched={touched}
      disabled={disabled}
      testID={`text-input-field-${textField.id}`}
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
          placeholder={textField.placeholder}
          secureTextEntry={textField.type === 'password'}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={textField.autoCorrect !== false && textField.type !== 'email'}
          editable={!disabled && !isReadonly}
          maxLength={textField.maxLength}
          style={inputStyles}
          // Accessibility props
          accessibilityLabel={textField.label}
          accessibilityHint={textField.description}
          // accessibilityRequired and accessibilityInvalid are not supported in React Native TextInput
          testID={`text-input-${textField.id}`}
          // Additional accessibility for password fields
          {...(textField.type === 'password' && {
            textContentType: 'password',
            passwordRules: 'minlength: 8;'
          })}
          // Additional accessibility for email fields
          {...(textField.type === 'email' && {
            textContentType: 'emailAddress',
            keyboardType: 'email-address'
          })}
        />

        {/* Character count indicator for fields with maxLength */}
        {textField.maxLength && (
          <View
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: '#6b7280',
                fontVariant: ['tabular-nums']
              }}
              accessibilityLabel={`${(value || '').length} of ${textField.maxLength} characters`}
            >
              {(value || '').length}/{textField.maxLength}
            </Text>
          </View>
        )}
      </View>
    </FieldWrapper>
  );
};

TextInputField.displayName = 'TextInputField';