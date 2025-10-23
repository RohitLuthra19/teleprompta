# JSON Form Library Design

## Overview

The JSON Form Library is a React Native component library that generates dynamic forms from JSON schemas. It integrates with Gluestack UI for consistent styling and provides comprehensive validation, accessibility, and user experience features.

## Architecture

### Core Components

```
Form (Main Container)
├── SchemaParser (JSON → Form Structure)
├── FieldRenderer (Field Type → Component Mapping)
├── ValidationEngine (Real-time Validation)
└── FieldComponents
    ├── TextInputField
    ├── EmailInputField
    ├── PasswordInputField
    ├── TextAreaField
    ├── NumberInputField
    └── FieldWrapper (Common Field Logic)
```

### Component Hierarchy

1. **Form Component**: Main orchestrator that manages form state, validation, and rendering
2. **SchemaParser**: Converts JSON schema into internal form structure
3. **FieldRenderer**: Maps field types to appropriate components using a registry pattern
4. **Field Components**: Individual input components with specialized behavior
5. **FieldWrapper**: Provides common functionality (labels, errors, accessibility)

## Components and Interfaces

### Form Component Interface

```typescript
interface FormProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onChange?: (values: Record<string, any>) => void;
  disabled?: boolean;
  events?: FormEvents;
}

interface FormRef {
  submit: () => Promise<void>;
  reset: () => void;
  validate: () => Promise<ValidationResult>;
  setFieldValue: (fieldId: string, value: any) => void;
  getValues: () => Record<string, any>;
}
```

### Schema Structure

```typescript
interface FormSchema {
  id: string;
  title?: string;
  description?: string;
  fields: BaseField[];
  layout?: LayoutConfig;
}

interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: any;
}
```

### Field Component Architecture

Each field component follows a consistent pattern:

1. **Props Interface**: Extends `FieldComponentProps` with field-specific properties
2. **Validation Logic**: Built-in validation for field type (email format, number ranges, etc.)
3. **Gluestack UI Integration**: Uses Gluestack UI components for consistent styling
4. **Accessibility**: Proper ARIA attributes and screen reader support
5. **Error Handling**: Integrates with form-level validation system

## Data Models

### Form State Management

```typescript
interface FormState {
  values: Record<string, any>;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  hasSubmitted: boolean;
}
```

### Validation System

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

interface ValidationErrors {
  [fieldId: string]: string[];
}
```

## Error Handling

### Validation Error Display Strategy

1. **On Mount**: No errors displayed initially
2. **On Field Interaction**: Errors appear only after field is touched or form is submitted
3. **On Typing**: Existing errors clear immediately when user starts typing
4. **On Submit**: All validation errors display if form is invalid

### Error Boundary Implementation

- Field-level error boundaries prevent individual field failures from crashing the entire form
- Graceful fallback components for unsupported field types
- Development-mode error details for debugging

## Testing Strategy

### Unit Testing Approach

1. **Field Component Tests**: Individual field behavior, validation, and accessibility
2. **Form Integration Tests**: Complete form workflows and state management
3. **Schema Parser Tests**: JSON schema parsing and validation
4. **Validation Engine Tests**: Validation rules and error handling

### Test Coverage Areas

- Field rendering and interaction
- Validation logic (required fields, format validation, custom rules)
- Accessibility compliance (ARIA attributes, keyboard navigation)
- Error state management
- Form submission and reset functionality

### Testing Tools

- Jest for unit testing framework
- React Native Testing Library for component testing
- Accessibility testing with built-in ARIA validation
- Mock implementations for external dependencies

## Gluestack UI Integration

### Component Mapping Strategy

- Replace React Native primitives (`View`, `Text`, `TextInput`) with Gluestack UI equivalents
- Use Gluestack UI design tokens for consistent spacing, colors, and typography
- Implement proper theme integration for light/dark mode support
- Maintain backward compatibility with custom styling props

### Styling Architecture

```typescript
// Gluestack UI component usage
import { VStack, Text, Input } from '@gluestack-ui/themed';

// Consistent spacing and styling
<VStack space="md">
  <Text size="md" fontWeight="$semibold">
    {field.label}
  </Text>
  <Input variant="outline" size="md">
    <InputField />
  </Input>
</VStack>
```

### Theme Integration

- Support for custom themes through Gluestack UI provider
- Consistent color schemes for validation states (error, success, warning)
- Responsive design patterns for different screen sizes
- Accessibility-compliant color contrast ratios