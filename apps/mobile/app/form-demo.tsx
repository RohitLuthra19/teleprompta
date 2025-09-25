import { Form } from '@/components';
import { FormSchema } from '@/components/types';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function FormDemo() {
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

  // Example form schema for script creation
  const scriptFormSchema: FormSchema = {
    id: 'script-creation',
    title: 'Create New Script',
    description: 'Add a new teleprompter script',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Script Title',
        placeholder: 'Enter script title',
        required: true,
        maxLength: 100,
        autoCapitalize: 'words'
      },
      {
        id: 'content',
        type: 'textarea',
        label: 'Script Content',
        placeholder: 'Enter your script content here...',
        required: true,
        rows: 8,
        maxLength: 5000,
        autoGrow: true,
        description: 'This is the text that will be displayed in the teleprompter'
      },
      {
        id: 'category',
        type: 'text',
        label: 'Category',
        placeholder: 'e.g., News, Presentation, Speech',
        maxLength: 50,
        description: 'Optional category to help organize your scripts'
      }
    ],
    layout: {
      type: 'vertical',
      spacing: 16
    }
  };

  const [currentSchema, setCurrentSchema] = React.useState<FormSchema>(userFormSchema);

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    Alert.alert(
      'Form Submitted!',
      `Form "${currentSchema.title}" submitted successfully!\n\nCheck the console for full data.`,
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
      {/* Header with form switcher */}
      <Box className="p-4 bg-background-0 border-b border-outline-200">
        <View className="flex-row gap-2">
          <Button
            size="sm"
            variant={currentSchema.id === 'user-registration' ? 'solid' : 'outline'}
            action="primary"
            onPress={() => setCurrentSchema(userFormSchema)}
            className="flex-1"
          >
            <ButtonText>User Form</ButtonText>
          </Button>
          <Button
            size="sm"
            variant={currentSchema.id === 'script-creation' ? 'solid' : 'outline'}
            action="primary"
            onPress={() => setCurrentSchema(scriptFormSchema)}
            className="flex-1"
          >
            <ButtonText>Script Form</ButtonText>
          </Button>
        </View>
      </Box>

      {/* Form */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Form
          key={currentSchema.id} // Force re-render when schema changes
          schema={currentSchema}
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