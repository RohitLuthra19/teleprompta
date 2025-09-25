import { Box, Input, InputField, Text } from '@/components/ui/';
import * as React from "react";
import { FieldWrapper } from "../FieldWrapper";
import type { FieldComponentProps, NumberField } from "../types";

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

  const inputFieldClass = `
    ${hasError ? 'border-red-500' : (disabled ? 'border-gray-300' : 'border-gray-300')}
    ${isReadonly ? 'bg-gray-50' : (disabled ? 'bg-gray-100' : 'bg-white')}
    ${disabled ? 'text-gray-400' : 'text-gray-900'}
    rounded-lg px-3 py-2 text-base leading-6 min-h-[44px] text-right
  `;

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
      hasSubmitted={context.hasSubmitted}
      testID={`number-input-field-${numberField.id}`}
    >
      <Box className="relative">
        <Input
          variant="outline"
          size="md"
          isDisabled={disabled || isReadonly}
          isInvalid={hasError}
        >
          <InputField
            value={displayValue}
            onChangeText={handleChangeText}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={numberField.placeholder}
            keyboardType="numeric"
            editable={!disabled && !isReadonly}
            accessibilityLabel={numberField.label}
            accessibilityHint={numberField.description}
            accessibilityRole="spinbutton"
            testID={`number-input-${numberField.id}`}
            className={inputFieldClass}
          />
        </Input>

        {/* Min/Max indicators */}
        {(numberField.min !== undefined || numberField.max !== undefined) && (
          <Box className="absolute right-2 bottom-2 bg-white/90 px-1 py-0.5 rounded-md">
            <Text
              className="text-xs text-gray-500 font-tabular-nums"
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
          </Box>
        )}

        {/* Step indicator */}
        {numberField.step && numberField.step !== 1 && (
          <Box className="absolute left-2 bottom-2 bg-white/90 px-1 py-0.5 rounded-md">
            <Text
              className="text-xs text-gray-500"
              accessibilityLabel={`Step: ${numberField.step}`}
            >
              Step: {numberField.step}
            </Text>
          </Box>
        )}
      </Box>
    </FieldWrapper>
  );
};

NumberInputField.displayName = "NumberInputField";
