import { fieldRenderer } from '../FieldRenderer';
import { EmailInputField } from './EmailInputField';
import { NumberInputField } from './NumberInputField';
import { PasswordInputField } from './PasswordInputField';
import { TextAreaField } from './TextAreaField';
import { TextInputField } from './TextInputField';

// Export all field components
export { EmailInputField } from './EmailInputField';
export { NumberInputField } from './NumberInputField';
export { PasswordInputField } from './PasswordInputField';
export { TextAreaField } from './TextAreaField';
export { TextInputField } from './TextInputField';

// Field component registry

/**
 * Register all built-in field components with the field renderer
 * This function should be called during library initialization
 */
export function registerBuiltInFieldComponents(): void {
  // Text-based fields
  fieldRenderer.registerFieldType('text', TextInputField);
  fieldRenderer.registerFieldType('email', EmailInputField);
  fieldRenderer.registerFieldType('password', PasswordInputField);
  
  // Multi-line text
  fieldRenderer.registerFieldType('textarea', TextAreaField);
  
  // Numeric fields
  fieldRenderer.registerFieldType('number', NumberInputField);
}

/**
 * Get all registered field types
 */
export function getRegisteredFieldTypes(): string[] {
  return fieldRenderer.getRegisteredFieldTypes();
}

/**
 * Check if a field type is supported
 */
export function isFieldTypeSupported(type: string): boolean {
  return fieldRenderer.isFieldTypeSupported(type);
}