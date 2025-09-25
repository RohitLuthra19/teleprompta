import { Box, Input, InputField, Text } from '@/components/ui/';
import * as React from 'react';
import { FieldWrapper } from '../FieldWrapper';
import type { FieldComponentProps, TextAreaField as TextAreaFieldType } from '../types';

/**
 * TextAreaField component for multi-line text input
 * Features auto-grow, word count, and enhanced formatting
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
  context,
}) => {
  const textAreaField = field.field as TextAreaFieldType;
  const hasError = error && error.length > 0 && touched;
  const isReadonly = textAreaField.readonly;
  const rows = textAreaField.rows || 4;
  const [contentHeight, setContentHeight] = React.useState<number | undefined>();

  // Calculate minimum height based on rows
  const minHeight = Math.max(rows * 20 + 20, 80); // 20px per row + padding
  const maxHeight = textAreaField.autoGrow ? Math.max(minHeight * 3, 200) : minHeight;

  // Calculate text statistics
  const textStats = React.useMemo(() => {
    const text = value || '';
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter((p: string) => p.trim()).length;
    
    return { characters, charactersNoSpaces, words, lines, paragraphs };
  }, [value]);

  // Input styles following Gluestack v3 patterns
  // Many of these styles will be handled by Gluestack's theming or directly on the components.
  // Remaining styles will be applied via className or Gluestack props.
  const inputFieldClassName = `
    ${hasError ? 'border-red-500' : (disabled ? 'border-gray-300' : 'border-gray-300')}
    ${isReadonly ? 'bg-gray-50' : (disabled ? 'bg-gray-100' : 'bg-white')}
    ${disabled ? 'text-gray-400' : 'text-gray-900'}
    rounded-lg px-3 py-2 text-base
  `;

  const handleChangeText = (text: string) => {
    // Apply max length constraint
    if (textAreaField.maxLength && text.length > textAreaField.maxLength) {
      return;
    }
    
    // Apply min length validation
    onChange(text);
  };

  const handleContentSizeChange = (event: any) => {
    if (textAreaField.autoGrow) {
      const newHeight = Math.min(Math.max(event.nativeEvent.contentSize.height + 20, minHeight), maxHeight);
      setContentHeight(newHeight);
    }
  };

  return (
    <FieldWrapper
      field={textAreaField}
      error={error}
      touched={touched}
      disabled={disabled}
      hasSubmitted={context.hasSubmitted}
      testID={`textarea-field-${textAreaField.id}`}
    >
      <Box className="relative">
        <Input
          variant="outline"
          size="md"
          isDisabled={disabled || isReadonly}
          isInvalid={hasError}
          style={{ height: contentHeight || minHeight, maxHeight: maxHeight }}
        >
          <InputField
            className={inputFieldClassName}
            value={value || ''}
            onChangeText={handleChangeText}
            onBlur={onBlur}
            onFocus={onFocus}
            onContentSizeChange={handleContentSizeChange}
            placeholder={textAreaField.placeholder}
            multiline
            numberOfLines={rows}
            editable={!disabled && !textAreaField.disabled && !isReadonly}
            maxLength={textAreaField.maxLength}
            accessibilityLabel={textAreaField.label}
            accessibilityHint={textAreaField.description}
            accessibilityRole="text"
            testID={`textarea-${textAreaField.id}`}
          />
        </Input>

        {/* Character count indicator for fields with maxLength */}
        {textAreaField.maxLength && (
          <Text
            className="absolute right-3 bottom-2 text-xs font-tabular-nums"
            accessibilityLabel={`${textStats.characters} of ${textAreaField.maxLength} characters`}
            style={{ color: textStats.characters >= textAreaField.maxLength * 0.9 ? '#ef4444' : '#6b7280' }}
          >
            {textStats.characters}/{textAreaField.maxLength}
          </Text>
        )}

        {/* Auto-grow indicator */}
        {textAreaField.autoGrow && (
          <Box className="absolute left-2 bottom-2 bg-white/90 px-1 py-0.5 rounded-md">
            <Text
              className="text-xs text-gray-400 italic"
              accessibilityLabel="Auto-expanding text area"
            >
              Auto-grow
            </Text>
          </Box>
        )}
      </Box>

      {/* Text statistics */}
      {value && value.length > 0 && (
        <Box className="mt-2 flex-row flex-wrap gap-3">
          <Text
            className="text-xs text-gray-500 font-tabular-nums"
            accessibilityLabel={`${textStats.words} words`}
          >
            {textStats.words} words
          </Text>
          <Text
            className="text-xs text-gray-500 font-tabular-nums"
            accessibilityLabel={`${textStats.lines} lines`}
          >
            {textStats.lines} lines
          </Text>
          {textStats.paragraphs > 1 && (
            <Text
              className="text-xs text-gray-500 font-tabular-nums"
              accessibilityLabel={`${textStats.paragraphs} paragraphs`}
            >
              {textStats.paragraphs} paragraphs
            </Text>
          )}
        </Box>
      )}

      {/* Min length warning */}
      {textAreaField.minLength && value && value.length > 0 && value.length < textAreaField.minLength && (
        <Box className="mt-2 p-2 bg-yellow-100 rounded-md border-l-4 border-l-orange-500">
          <Text
            className="text-xs text-orange-800"
            accessibilityRole="text"
          >
            Minimum {textAreaField.minLength} characters required ({textAreaField.minLength - value.length} more needed)
          </Text>
        </Box>
      )}
    </FieldWrapper>
  );
};

TextAreaField.displayName = 'TextAreaField';