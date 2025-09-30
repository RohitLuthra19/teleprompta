import { Form } from '@/components';
import { apiFetch } from '@/components/api';
import { FormSchema } from '@/components/types';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function Signup() {
  const router = useRouter();

  const userFormSchema: FormSchema = {
    id: 'user-registration',
    title: 'Create account',
    description: 'Join Teleprompta',
    fields: [
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
        placeholder: 'Create a secure password',
        required: true,
        minLength: 8
      }
    ],
    layout: {
      type: 'vertical',
      spacing: 16
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      await apiFetch('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, password: values.password })
      });
      Alert.alert('Success', 'Account created. Please log in.', [{ text: 'OK' }]);
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Signup failed');
    }
  };

  const handleChange = (values: Record<string, any>) => {
    console.log('Signup form changed:', values);
  };

  const handleValidationChange = (isValid: boolean, errors: any) => {
    console.log('Signup validation changed:', { isValid, errors });
  };

  return (
    <View className="flex-1 bg-background-100">
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

      <Box className="p-4 bg-background-0 border-t border-outline-200">
        <Button
          size="lg"
          variant="outline"
          action="secondary"
          onPress={() => router.back()}
        >
          <ButtonText>Back</ButtonText>
        </Button>
        <View className="h-3" />
        <Button
          size="lg"
          action="primary"
          onPress={() => router.push('/(auth)/login')}
        >
          <ButtonText>Already have an account? Log in</ButtonText>
        </Button>
      </Box>
    </View>
  );
}


