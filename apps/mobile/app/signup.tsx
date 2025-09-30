import { Form } from '@/components';
import { FormSchema } from '@/components/types';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function Signup() {
  const router = useRouter();

  // Example form schema for user registration
  const userFormSchema: FormSchema = {
    id: 'user-registration',
    title: 'User Registration',
    description: 'Create your account to get started',
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
        autoCapitalize: 'words'
      },
      {
        id: 'lastName',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true,
        autoCapitalize: 'words'
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        description: 'We\'ll use this to send you important updates'
      },
      {
        id: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Create a secure password',
        required: true,
        minLength: 8,
        description: 'Must be at least 8 characters long'
      },
      {
        id: 'bio',
        type: 'textarea',
        label: 'Bio (Optional)',
        placeholder: 'Tell us a bit about yourself...',
        rows: 4,
        maxLength: 500,
        autoGrow: true,
        description: 'Share your interests, background, or anything you\'d like others to know'
      }
    ],
    layout: {
      type: 'vertical',
      spacing: 16
    }
  };

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    Alert.alert(
      'Form Submitted!',
      `Form submitted successfully!\n\nCheck the console for full data.`,
      [{ text: 'OK' }]
    );
  };

  const handleChange = (values: Record<string, any>) => {
    console.log('Form values changed:', values);
  };

  const handleValidationChange = (isValid: boolean, errors: any) => {
    console.log('Validation changed:', { isValid, errors });
  };

  return (
    <View className="flex-1 bg-background-100">

      {/* Form */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Form
          schema={userFormSchema}
          initialValues={{}}
          events={{
            submit: handleSubmit,
            change: handleChange,
            validationChange: handleValidationChange
          }}
        />
      </ScrollView>

      {/* Back button */}
      <Box className="p-4 bg-background-0 border-t border-outline-200">
        <Button
          size="lg"
          variant="outline"
          action="secondary"
          onPress={() => router.back()}
        >
          <ButtonText>Back to Home</ButtonText>
        </Button>
      </Box>
    </View>
  );
}