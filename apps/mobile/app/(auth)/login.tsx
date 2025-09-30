import { Form } from '@/components';
import { apiFetch } from '@/components/api';
import { saveToken } from '@/components/auth';
import { FormSchema } from '@/components/types';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function Login() {
  const router = useRouter();

  const loginFormSchema: FormSchema = {
    id: 'user-login',
    title: 'Login',
    description: 'Access your account',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true
      },
      {
        id: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        required: true,
        minLength: 6
      }
    ],
    layout: {
      type: 'vertical',
      spacing: 16
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      const data = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, password: values.password })
      });
      await saveToken(data.token);
      Alert.alert('Success', 'Logged in successfully', [{ text: 'OK' }]);
      // Navigate to home
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Login failed');
    }
  };

  const handleChange = (values: Record<string, any>) => {
    console.log('Login form changed:', values);
  };

  const handleValidationChange = (isValid: boolean, errors: any) => {
    console.log('Login validation changed:', { isValid, errors });
  };

  return (
    <View className="flex-1 bg-background-100">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Form
          schema={loginFormSchema}
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
          onPress={() => router.push('/(auth)/signup')}
        >
          <ButtonText>Create an account</ButtonText>
        </Button>
      </Box>
    </View>
  );
}


