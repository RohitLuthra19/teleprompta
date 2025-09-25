import { Box, Input, InputField, Pressable, Text } from '@/components/ui/';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import * as React from "react";
import { FieldWrapper } from '../FieldWrapper';
import type { FieldComponentProps, TextField } from '../types';

/**
 * PasswordInputField component for secure password input
 * Features password visibility toggle and strength indicators
 * Integrates with Gluestack v3 styling patterns
 */
export const PasswordInputField: React.FC<FieldComponentProps> = ({
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
  const passwordField = field.field as TextField;
  const hasError = error && error.length > 0 && touched;
  const isReadonly = passwordField.readonly;
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (
    password: string
  ): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: "", color: "#d1d5db" };

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength label and color
    if (score <= 2) return { score, label: "Weak", color: "#ef4444" };
    if (score <= 4) return { score, label: "Medium", color: "#f59e0b" };
    return { score, label: "Strong", color: "#10b981" };
  };

  const passwordStrength = calculatePasswordStrength(value || "");

  // Input styles following Gluestack v3 patterns
  const inputFieldClass = `
    ${hasError ? 'border-red-500' : (disabled ? 'border-gray-300' : 'border-gray-300')}
    ${isReadonly ? 'bg-gray-50' : (disabled ? 'bg-gray-100' : 'bg-white')}
    ${disabled ? 'text-gray-400' : 'text-gray-900'}
    rounded-lg px-3 py-2 text-base leading-6 min-h-[44px] pr-12
  `;

  const handleChangeText = (text: string) => {
    // Apply max length constraint
    if (passwordField.maxLength && text.length > passwordField.maxLength) {
      return;
    }

    onChange(text);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <FieldWrapper
      field={passwordField}
      error={error}
      touched={touched}
      disabled={disabled}
      hasSubmitted={context.hasSubmitted}
      testID={`password-input-field-${passwordField.id}`}
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
            value={value || ""}
            onChangeText={handleChangeText}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={passwordField.placeholder}
            secureTextEntry={!isPasswordVisible}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!disabled && !passwordField.disabled && !isReadonly}
            maxLength={passwordField.maxLength}
            accessibilityLabel={passwordField.label}
            accessibilityHint={passwordField.description}
            testID={`password-input-${passwordField.id}`}
            textContentType="password"
            passwordRules="minlength: 8;"
          />
        </Input>

        {/* Password visibility toggle */}
        {!isReadonly && (
          <Pressable
            onPress={togglePasswordVisibility}
            disabled={disabled}
            className="absolute right-3 top-2.5 w-6 h-6 justify-center items-center"
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
            accessibilityRole="button"
            testID={`password-toggle-${passwordField.id}`}
          >
            {isPasswordVisible ? (
              <EyeOffIcon size={20} color={disabled ? "#9ca3af" : "#6b7280"} />
            ) : (
              <EyeIcon size={20} color={disabled ? "#9ca3af" : "#6b7280"} />
            )}
          </Pressable>
        )}

        {/* Password strength indicator */}
        {value && value.length > 0 && (
          <Box className="mt-2 flex-row items-center">
            <Box className="flex-1 h-1 bg-gray-200 rounded-sm mr-2">
              <Box
                className="h-full rounded-sm"
                style={{
                  width: `${(passwordStrength.score / 6) * 100}%`,
                  backgroundColor: passwordStrength.color,
                }}
              />
            </Box>
            {passwordStrength.label && (
              <Text
                className={`text-xs font-medium`}
                style={{ color: passwordStrength.color }}
                accessibilityLabel={`Password strength: ${passwordStrength.label}`}
              >
                {passwordStrength.label}
              </Text>
            )}
          </Box>
        )}

        {/* Character count indicator for fields with maxLength */}
        {passwordField.maxLength && (
          <Box className="mt-1 items-end">
            <Text
              className="text-xs text-gray-500 font-tabular-nums"
              accessibilityLabel={`${(value || "").length} of ${
                passwordField.maxLength
              } characters`}
            >
              {(value || "").length}/{passwordField.maxLength}
            </Text>
          </Box>
        )}

      </Box>
    </FieldWrapper>
  );
};

PasswordInputField.displayName = "PasswordInputField";
