import { Form } from '@/components';
import { apiFetch } from '@/components/api';
import { FormSchema } from '@/components/types';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { useAuthGate } from '@/components/useAuthGate';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function AddScript() {
  const router = useRouter();
  const { isReady } = useAuthGate();

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
        id: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter a short description...',
        required: true,
        rows: 4,
        maxLength: 1000,
        autoGrow: true
      },
      {
        id: 'category',
        type: 'text',
        label: 'Categories (comma separated)',
        placeholder: 'e.g., News, Presentation, Speech',
        description: 'Optional categories to help organize your scripts'
      }
    ],
    layout: {
      type: 'vertical',
      spacing: 16
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      const category = typeof values.category === 'string' && values.category.trim().length
        ? values.category.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      await apiFetch('/api/v1/scripts', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ title: values.title, description: values.description, category })
      });

      Alert.alert('Success', 'Script created');
      router.replace('/scripts-list');
    } catch (e: any) {
      // Authentication errors are now handled automatically in apiFetch
      Alert.alert('Error', e.message || 'Failed to create script');
    }
  };

  const handleChange = (values: Record<string, any>) => {};
  const handleValidationChange = (isValid: boolean, errors: any) => {};

  if (!isReady) return null;

  return (
    <View className="flex-1 bg-background-100">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Form
          schema={scriptFormSchema}
          initialValues={{}}
          events={{
            submit: handleSubmit,
            change: handleChange,
            validationChange: handleValidationChange
          }}
        />
      </ScrollView>

      <Box className="p-4 bg-background-0 border-t border-outline-200">
        <Button
          size="lg"
          variant="outline"
          action="secondary"
          onPress={() => router.back()}
        >
          <ButtonText>Back</ButtonText>
        </Button>
      </Box>
    </View>
  );
}


