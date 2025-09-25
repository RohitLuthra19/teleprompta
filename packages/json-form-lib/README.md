# JSON Form Library

A React Native form library that generates dynamic forms from JSON schemas with advanced field components and validation.

## ✅ Current Status: USABLE

The library is currently **usable** with the following implemented features:

### 🎯 Available Field Components

- **TextInputField** - Basic text input with character limits
- **EmailInputField** - Email input with validation and smart suggestions  
- **PasswordInputField** - Password input with strength indicator and visibility toggle
- **TextAreaField** - Multi-line text with auto-grow and text statistics
- **NumberInputField** - Numeric input with formatting and constraints

### 🚀 Key Features

- **Schema-driven forms** - Define forms using JSON schemas
- **Real-time validation** - Instant feedback with visual indicators
- **Accessibility support** - Full screen reader and keyboard navigation
- **Gluestack v3 styling** - Consistent design system integration
- **TypeScript support** - Full type safety and IntelliSense

## 📦 Installation

```bash
npm install json-form-lib
```

## 🔧 Basic Usage

```tsx
import React from 'react';
import { Form } from 'json-form-lib';
import type { FormSchema } from 'json-form-lib';

const MyForm = () => {
  const schema: FormSchema = {
    id: 'user-form',
    title: 'User Registration',
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
        maxLength: 50
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true
      },
      {
        id: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Create a password',
        required: true,
        minLength: 8
      },
      {
        id: 'bio',
        type: 'textarea',
        label: 'Bio',
        placeholder: 'Tell us about yourself',
        rows: 4,
        maxLength: 500
      }
    ]
  };

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
  };

  return (
    <Form
      schema={schema}
      events={{ submit: handleSubmit }}
    />
  );
};
```

## 🎨 Field Types

### Text Input
```json
{
  "id": "firstName",
  "type": "text",
  "label": "First Name",
  "maxLength": 50,
  "autoCapitalize": "words"
}
```

### Email Input
```json
{
  "id": "email",
  "type": "email",
  "label": "Email Address",
  "maxLength": 100
}
```
- Real-time email validation
- Smart domain suggestions (e.g., "gmailcom" → "gmail.com")
- Automatic lowercase conversion

### Password Input
```json
{
  "id": "password",
  "type": "password",
  "label": "Password",
  "minLength": 8,
  "maxLength": 128
}
```
- Password strength indicator
- Visibility toggle button
- Character count display

### Text Area
```json
{
  "id": "description",
  "type": "textarea",
  "label": "Description",
  "rows": 4,
  "maxLength": 500,
  "autoGrow": true
}
```
- Auto-growing height
- Word/line/paragraph count
- Min/max length validation

## 🧪 Testing

The library includes comprehensive test coverage:

```bash
npm test
```

- **132 tests passing** across all field components
- Unit tests for validation logic
- Accessibility testing
- User interaction testing

## 🏗️ Build

```bash
npm run build
```

Compiles TypeScript to JavaScript with full type definitions.

## 🔮 Coming Soon

- Select/dropdown fields
- Radio button groups  
- Checkbox fields
- Date/time pickers
- File upload fields
- Advanced validation engine
- Conditional field logic
- Custom field components

## 📝 Example

See `example.tsx` for a complete working example.

## 🤝 Contributing

This library is actively being developed. Current implementation covers core text-based field components with full functionality.