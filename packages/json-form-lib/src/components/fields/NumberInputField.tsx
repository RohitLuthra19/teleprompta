import React from "react";
import { Text, TextInput, View } from "react-native";
import type { FieldComponentProps, NumberField } from "../../types";
import { FieldWrapper } from "../FieldWrapper";

/**
 * NumberInputField component for numeric input with validation
 * Integrates with Gluestack v3 styling patterns
 */
export const NumberInputField: React.FC<FieldComponentProps> = ({
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
  const numberField = field.field as NumberField;
  const hasError = error && error.length > 0 && touched;
  const isReadonly = numberField.readonly;

  // Format number based on field configuration
  const formatNumber = (num: number): string => {
    if (isNaN(num)) return "";

    switch (numberField.format) {
      case "integer":
        return Math.floor(num).toString();
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(num);
      case "percentage":
        return `${(num * 100).toFixed(numberField.precision || 2)}%`;
      case "decimal":
      default:
        return numberField.precision !== undefined
          ? num.toFixed(numberField.precision)
          : num.toString();
    }
  };

  // Parse input text to number
  const parseNumber = (text: string): number => {
    // Remove currency symbols and percentage signs for parsing
    const cleanText = text.replace(/[$,%]/g, "");
    const num = parseFloat(cleanText);
    return isNaN(num) ? 0 : num;
  };

  // Validate number against constraints
  const validateNumber = (num: number): string | null => {
    if (numberField.min !== undefined && num < numberField.min) {
      return `Value must be at least ${numberField.min}`;
    }
    if (numberField.max !== undefined && num > numberField.max) {
      return `Value must be at most ${numberField.max}`;
    }
    return null;
  };

  // Input styles following Gluestack v3 patterns
  const inputStyles = {
    borderWidth: 1,
    borderColor: hasError ? "#ef4444" : disabled ? "#d1d5db" : "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: isReadonly ? "#f9fafb" : disabled ? "#f3f4f6" : "#ffffff",
    color: disabled ? "#9ca3af" : "#111827",
    minHeight: 44, // Accessibility minimum touch target
    textAlign: "right" as const, // Numbers typically align right
    // Focus styles (web only)
    ...(hasError
      ? {}
      : {
          outlineColor: "transparent",
          outlineWidth: 0,
        }),
  };

  const handleChangeText = (text: string) => {
    // Allow empty string
    if (text === "") {
      onChange("");
      return;
    }

    const num = parseNumber(text);

    // Apply step constraint if specified
    if (numberField.step && numberField.step !== 1) {
      const steppedValue =
        Math.round(num / numberField.step) * numberField.step;
      onChange(steppedValue);
    } else {
      onChange(num);
    }
  };

  // Format display value
  const displayValue = React.useMemo(() => {
    if (value === "" || value === null || value === undefined) return "";
    const num =
      typeof value === "number" ? value : parseNumber(value.toString());
    return formatNumber(num);
  }, [value, numberField.format, numberField.precision]);

  return (
    <FieldWrapper
      field={numberField}
      error={error}
      touched={touched}
      disabled={disabled}
      testID={`number-input-field-${numberField.id}`}
    >
      <View
        style={{
          position: "relative",
        }}
      >
        <TextInput
          value={displayValue}
          onChangeText={handleChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={numberField.placeholder}
          keyboardType="numeric"
          editable={!disabled && !isReadonly}
          style={inputStyles}
          // Accessibility props
          accessibilityLabel={numberField.label}
          accessibilityHint={numberField.description}
          // accessibilityRequired and accessibilityInvalid are not supported in React Native TextInput
          accessibilityRole="spinbutton"
          testID={`number-input-${numberField.id}`}
        />

        {/* Min/Max indicators */}
        {(numberField.min !== undefined || numberField.max !== undefined) && (
          <View
            style={{
              position: "absolute",
              right: 8,
              bottom: 8,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: "#6b7280",
                fontVariant: ["tabular-nums"],
              }}
              accessibilityLabel={`Range: ${
                numberField.min || "no minimum"
              } to ${numberField.max || "no maximum"}`}
            >
              {numberField.min !== undefined && numberField.max !== undefined
                ? `${numberField.min}-${numberField.max}`
                : numberField.min !== undefined
                ? `≥${numberField.min}`
                : `≤${numberField.max}`}
            </Text>
          </View>
        )}

        {/* Step indicator */}
        {numberField.step && numberField.step !== 1 && (
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
                fontSize: 10,
                color: "#6b7280",
              }}
              accessibilityLabel={`Step: ${numberField.step}`}
            >
              Step: {numberField.step}
            </Text>
          </View>
        )}
      </View>
    </FieldWrapper>
  );
};

NumberInputField.displayName = "NumberInputField";
