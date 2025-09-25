import * as React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldComponentProps, TextField } from '../../types';
import { FieldWrapper } from '../FieldWrapper';

/**
 * EmailInputField component for email address input with validation
 * Features real-time email format validation and suggestions
 * Integrates with Gluestack v3 styling patterns
 */
export const EmailInputField: React.FC<FieldComponentProps> = ({
  field,
  value,
  error,
  touched,
  disabled,
  onChange,
  onBlur,
  onFocus,
}) => {
  const emailField = field.field as TextField;
  const hasError = error && error.length > 0 && touched;
  const isReadonly = emailField.readonly;

  // Email validation regex (balanced validation)
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

  // Validate email format
  const validateEmail = (email: string): { isValid: boolean; suggestion?: string } => {
    if (!email) return { isValid: true }; // Empty is valid (required validation is separate)
    
    const isValid = emailRegex.test(email);
    
    // Common domain suggestions
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    let suggestion: string | undefined;
    
    if (!isValid && email.includes('@')) {
      const [localPart, domainPart] = email.split('@');
      if (localPart && domainPart) {
        // Check for common typos in domains
        const lowerDomain = domainPart.toLowerCase();
        
        // Check for specific common typos
        if (lowerDomain === 'gmai.com' || lowerDomain === 'gmial.com' || lowerDomain === 'gmailcom') {
          suggestion = `${localPart}@gmail.com`;
        } else if (lowerDomain === 'yahooo.com' || lowerDomain === 'yaho.com' || lowerDomain === 'yahoocom') {
          suggestion = `${localPart}@yahoo.com`;
        } else if (lowerDomain === 'hotmial.com' || lowerDomain === 'hotmai.com' || lowerDomain === 'hotmailcom') {
          suggestion = `${localPart}@hotmail.com`;
        } else {
          // More general similarity check
          const similarDomain = commonDomains.find(domain => {
            return Math.abs(domain.length - lowerDomain.length) <= 2 && 
                   (domain.includes(lowerDomain.substring(0, 3)) || 
                    lowerDomain.includes(domain.substring(0, 3)));
          });
          
          if (similarDomain) {
            suggestion = `${localPart}@${similarDomain}`;
          }
        }
      }
    }
    
    return { isValid, suggestion };
  };

  const emailValidation = React.useMemo(() => validateEmail(value || ''), [value]);

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
      outlineColor: 'transparent',
      outlineWidth: 0,
    })
  };

  const handleChangeText = (text: string) => {
    // Apply max length constraint
    if (emailField.maxLength && text.length > emailField.maxLength) {
      return;
    }
    
    // Convert to lowercase for email
    const emailText = text.toLowerCase().trim();
    onChange(emailText);
  };

  const handleSuggestionPress = () => {
    if (emailValidation.suggestion) {
      onChange(emailValidation.suggestion);
    }
  };

  return (
    <FieldWrapper
      field={emailField}
      error={error}
      touched={touched}
      disabled={disabled}
      testID={`email-input-field-${emailField.id}`}
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
          placeholder={emailField.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled && !emailField.disabled && !isReadonly}
          maxLength={emailField.maxLength}
          style={inputStyles}
          // Accessibility props
          accessibilityLabel={emailField.label}
          accessibilityHint={emailField.description}
          testID={`email-input-${emailField.id}`}
          // Email-specific accessibility
          textContentType="emailAddress"
          autoComplete="email"
        />

        {/* Email validation indicator */}
        {value && value.length > 0 && (
          <View
            style={{
              position: 'absolute',
              right: 12,
              top: 10,
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: emailValidation.isValid ? '#10b981' : '#ef4444'
              }}
              accessibilityLabel={emailValidation.isValid ? 'Valid email format' : 'Invalid email format'}
            >
              {emailValidation.isValid ? '✓' : '✗'}
            </Text>
          </View>
        )}

        {/* Character count indicator for fields with maxLength */}
        {emailField.maxLength && (
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
                fontSize: 12,
                color: '#6b7280',
                fontVariant: ['tabular-nums']
              }}
              accessibilityLabel={`${(value || '').length} of ${emailField.maxLength} characters`}
            >
              {(value || '').length}/{emailField.maxLength}
            </Text>
          </View>
        )}
      </View>

      {/* Email suggestion */}
      {emailValidation.suggestion && !emailValidation.isValid && value && value.length > 0 && (
        <View
          style={{
            marginTop: 8,
            padding: 8,
            backgroundColor: '#f3f4f6',
            borderRadius: 6,
            borderLeftWidth: 3,
            borderLeftColor: '#3b82f6'
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: '#374151',
              marginBottom: 4
            }}
          >
            Did you mean:
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#3b82f6',
              fontWeight: '500',
              textDecorationLine: 'underline'
            }}
            onPress={handleSuggestionPress}
            accessibilityRole="button"
            accessibilityLabel={`Use suggested email: ${emailValidation.suggestion}`}
            testID={`email-suggestion-${emailField.id}`}
          >
            {emailValidation.suggestion}
          </Text>
        </View>
      )}

      {/* Email format help */}
      {value && value.length > 0 && !emailValidation.isValid && !emailValidation.suggestion && (
        <View
          style={{
            marginTop: 8,
            padding: 8,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            borderLeftWidth: 3,
            borderLeftColor: '#f59e0b'
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: '#92400e'
            }}
            accessibilityRole="text"
          >
            Please enter a valid email address (e.g., user@example.com)
          </Text>
        </View>
      )}
    </FieldWrapper>
  );
};

EmailInputField.displayName = 'EmailInputField';