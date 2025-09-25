import React from 'react';
import type { FormSchema } from './src';
import { Form } from './src';

// Example usage of the json-form-lib
const ExampleForm: React.FC = () => {
  const schema: FormSchema = {
    id: 'user-registration',
    title: 'User Registration',
    description: 'Please fill out your information',
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
        id: 'lastName',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true,
        maxLength: 50
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        maxLength: 100
      },
      {
        id: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Create a password',
        required: true,
        minLength: 8,
        maxLength: 128
      },
      {
        id: 'bio',
        type: 'textarea',
        label: 'Bio',
        placeholder: 'Tell us about yourself',
        rows: 4,
        maxLength: 500,
        autoGrow: true
      }
    ],
    layout: {
      type: 'vertical',
      spacing: 16
    }
  };

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    alert('Form submitted successfully!');
  };

  const handleChange = (values: Record<string, any>) => {
    console.log('Form values changed:', values);
  };

  return (
    <Form
      schema={schema}
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        bio: ''
      }}
      events={{
        submit: handleSubmit,
        change: handleChange
      }}
    />
  );
};

export default ExampleForm;