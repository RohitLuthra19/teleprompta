import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import type { FieldComponentProps, TextField } from "../../types";
import { FieldWrapper } from "../FieldWrapper";

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
  const inputStyles = {
    borderWidth: 1,
    borderColor: hasError ? "#ef4444" : disabled ? "#d1d5db" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 48, // Space for visibility toggle
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: isReadonly ? "#f9fafb" : disabled ? "#f3f4f6" : "#ffffff",
    color: disabled ? "#9ca3af" : "#111827",
    minHeight: 44, // Accessibility minimum touch target
    // Focus styles (web only)
    ...(hasError
      ? {}
      : {
          outlineColor: "transparent",
          outlineWidth: 0,
        }),
  };

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
      <View
        style={{
          position: "relative",
        }}
      >
        <TextInput
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
          style={inputStyles}
          // Accessibility props
          accessibilityLabel={passwordField.label}
          accessibilityHint={passwordField.description}
          testID={`password-input-${passwordField.id}`}
          // Password-specific accessibility
          textContentType="password"
          passwordRules="minlength: 8;"
        />

        {/* Password visibility toggle */}
        {!isReadonly && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            disabled={disabled}
            style={{
              position: "absolute",
              right: 12,
              top: 10,
              width: 24,
              height: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
            accessibilityRole="button"
            testID={`password-toggle-${passwordField.id}`}
          >
            <Text
              style={{
                fontSize: 16,
                color: disabled ? "#9ca3af" : "#6b7280",
              }}
            >
              {isPasswordVisible ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Password strength indicator */}
        {value && value.length > 0 && (
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "#e5e7eb",
                borderRadius: 2,
                marginRight: 8,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${(passwordStrength.score / 6) * 100}%`,
                  backgroundColor: passwordStrength.color,
                  borderRadius: 2,
                }}
              />
            </View>
            {passwordStrength.label && (
              <Text
                style={{
                  fontSize: 12,
                  color: passwordStrength.color,
                  fontWeight: "500",
                }}
                accessibilityLabel={`Password strength: ${passwordStrength.label}`}
              >
                {passwordStrength.label}
              </Text>
            )}
          </View>
        )}

        {/* Character count indicator for fields with maxLength */}
        {passwordField.maxLength && (
          <View
            style={{
              position: "absolute",
              left: 8,
              bottom: 8,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#6b7280",
                fontVariant: ["tabular-nums"],
              }}
              accessibilityLabel={`${(value || "").length} of ${
                passwordField.maxLength
              } characters`}
            >
              {(value || "").length}/{passwordField.maxLength}
            </Text>
          </View>
        )}
      </View>
    </FieldWrapper>
  );
};

PasswordInputField.displayName = "PasswordInputField";
