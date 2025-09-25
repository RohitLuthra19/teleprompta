import { Box, Input, InputField, Text } from '@/components/ui/';
import { FieldWrapper } from "../FieldWrapper";
import type { FieldComponentProps, TextField } from "../types";

/**
 * TextInputField component for basic text input fields
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
  context,
}) => {
  const textField = field.field as TextField;
  const hasError = error && error.length > 0 && touched;
  const isReadonly = textField.readonly;

  // Input styles following Gluestack v3 patterns
  const inputFieldClass = `
    ${hasError ? 'border-red-500' : (disabled ? 'border-gray-300' : 'border-gray-300')}
    ${isReadonly ? 'bg-gray-50' : (disabled ? 'bg-gray-100' : 'bg-white')}
    ${disabled ? 'text-gray-400' : 'text-gray-900'}
    rounded-lg px-3 py-2 text-base leading-6 min-h-[44px]
  `;

  const handleChangeText = (text: string) => {
    // Apply max length constraint
    if (textField.maxLength && text.length > textField.maxLength) {
      return;
    }

    // Apply min length validation on blur
    onChange(text);
  };

  return (
    <FieldWrapper
      field={textField}
      error={error}
      touched={touched}
      disabled={disabled}
      hasSubmitted={context.hasSubmitted}
      testID={`text-input-field-${textField.id}`}
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
            placeholder={textField.placeholder}
            keyboardType="default"
            autoCapitalize={textField.autoCapitalize || "sentences"}
            autoCorrect={textField.autoCorrect !== false}
            editable={!disabled && !textField.disabled && !isReadonly}
            maxLength={textField.maxLength}
            accessibilityLabel={textField.label}
            accessibilityHint={textField.description}
            testID={`text-input-${textField.id}`}
          />
        </Input>

        {/* Character count indicator for fields with maxLength */}
        {textField.maxLength && (
          <Text
            className="absolute right-3 bottom-2 text-xs text-gray-500 font-tabular-nums"
            accessibilityLabel={`${(value || "").length} of ${
              textField.maxLength
            } characters`}
          >
            {(value || "").length}/{textField.maxLength}
          </Text>
        )}
      </Box>
    </FieldWrapper>
  );
};

TextInputField.displayName = "TextInputField";
