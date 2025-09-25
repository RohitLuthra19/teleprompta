import { Box, Input, InputField, Text } from '@/components/ui/';
import * as React from 'react';
import { FieldWrapper } from '../FieldWrapper';
import type { FieldComponentProps, TextField } from '../types';

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
  context,
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
  // Many of these styles will be handled by Gluestack's theming or directly on the components.
  // Remaining styles will be applied via className or Gluestack props.
  const inputFieldClass = `
    ${hasError ? 'border-red-500' : (disabled ? 'border-gray-300' : 'border-gray-300')}
    ${isReadonly ? 'bg-gray-50' : (disabled ? 'bg-gray-100' : 'bg-white')}
    ${disabled ? 'text-gray-400' : 'text-gray-900'}
    rounded-lg px-3 py-2 text-base leading-6 min-h-[44px]
  `;

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
      hasSubmitted={context.hasSubmitted}
      testID={`email-input-field-${emailField.id}`}
    >
      <Box className="relative">
        <Input
          variant="outline"
          size="md"
          isDisabled={disabled || isReadonly}
          isInvalid={hasError}
        >
          <InputField
            className={inputFieldClass}
            value={value || ''}
            onChangeText={handleChangeText}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={emailField.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={emailField.maxLength}
            accessibilityLabel={emailField.label}
            accessibilityHint={emailField.description}
            testID={`email-input-${emailField.id}`}
            // Email-specific accessibility
            textContentType="emailAddress"
            autoComplete="email"
          />
        </Input>

        {/* Email validation indicator */}
        {value && value.length > 0 && (
          <Box className="absolute right-3 top-2.5 w-6 h-6 justify-center items-center">
            <Text
              className={
                emailValidation.isValid ? "text-green-500" : "text-red-500"
              }
              accessibilityLabel={emailValidation.isValid ? 'Valid email format' : 'Invalid email format'}
            >
              {emailValidation.isValid ? '✓' : '✗'}
            </Text>
          </Box>
        )}


      </Box>

      {/* Character count indicator for fields with maxLength */}
      {emailField.maxLength && (
        <Box className="mt-1 items-end">
          <Text
            className="text-xs text-gray-500 font-tabular-nums"
            accessibilityLabel={`${(value || '').length} of ${emailField.maxLength} characters`}
          >
            {(value || '').length}/{emailField.maxLength}
          </Text>
        </Box>
      )}

      {/* Email suggestion */}
      {emailValidation.suggestion && !emailValidation.isValid && value && value.length > 0 && (
        <Box className="mt-2 p-2 bg-gray-100 rounded-md border-l-4 border-l-blue-500">
          <Text className="text-sm text-gray-700 mb-1">
            Did you mean:
          </Text>
          <Text
            className="text-sm text-blue-500 font-medium underline"
            onPress={handleSuggestionPress}
            accessibilityRole="button"
            accessibilityLabel={`Use suggested email: ${emailValidation.suggestion}`}
            testID={`email-suggestion-${emailField.id}`}
          >
            {emailValidation.suggestion}
          </Text>
        </Box>
      )}

      {/* Email format help */}
      {value && value.length > 0 && !emailValidation.isValid && !emailValidation.suggestion && (
        <Box className="mt-2 p-2 bg-yellow-100 rounded-md border-l-4 border-l-orange-500">
          <Text
            className="text-xs text-orange-800"
            accessibilityRole="text"
          >
            Please enter a valid email address (e.g., user@example.com)
          </Text>
        </Box>
      )}
    </FieldWrapper>
  );
};

EmailInputField.displayName = 'EmailInputField';