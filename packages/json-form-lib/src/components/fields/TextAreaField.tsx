import * as React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldComponentProps, TextAreaField as TextAreaFieldType } from '../../types';
import { FieldWrapper } from '../FieldWrapper';

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
    maxHeight: textAreaField.autoGrow ? maxHeight : minHeight,
    height: textAreaField.autoGrow ? (contentHeight || minHeight) : minHeight,
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
          onContentSizeChange={handleContentSizeChange}
          placeholder={textAreaField.placeholder}
          multiline
          numberOfLines={rows}
          editable={!disabled && !textAreaField.disabled && !isReadonly}
          maxLength={textAreaField.maxLength}
          style={inputStyles}
          // Accessibility props
          accessibilityLabel={textAreaField.label}
          accessibilityHint={textAreaField.description}
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
                color: textStats.characters >= textAreaField.maxLength * 0.9 ? '#ef4444' : '#6b7280',
                fontVariant: ['tabular-nums']
              }}
              accessibilityLabel={`${textStats.characters} of ${textAreaField.maxLength} characters`}
            >
              {textStats.characters}/{textAreaField.maxLength}
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

      {/* Text statistics */}
      {value && value.length > 0 && (
        <View
          style={{
            marginTop: 8,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: '#6b7280',
              fontVariant: ['tabular-nums']
            }}
            accessibilityLabel={`${textStats.words} words`}
          >
            {textStats.words} words
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#6b7280',
              fontVariant: ['tabular-nums']
            }}
            accessibilityLabel={`${textStats.lines} lines`}
          >
            {textStats.lines} lines
          </Text>
          {textStats.paragraphs > 1 && (
            <Text
              style={{
                fontSize: 12,
                color: '#6b7280',
                fontVariant: ['tabular-nums']
              }}
              accessibilityLabel={`${textStats.paragraphs} paragraphs`}
            >
              {textStats.paragraphs} paragraphs
            </Text>
          )}
        </View>
      )}

      {/* Min length warning */}
      {textAreaField.minLength && value && value.length > 0 && value.length < textAreaField.minLength && (
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
            Minimum {textAreaField.minLength} characters required ({textAreaField.minLength - value.length} more needed)
          </Text>
        </View>
      )}
    </FieldWrapper>
  );
};

TextAreaField.displayName = 'TextAreaField';