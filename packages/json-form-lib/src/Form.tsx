import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import type { FormProps, FormRef, ValidationErrors, ValidationResult } from "./types";

export const Form = React.forwardRef<FormRef, FormProps>(({ 
  schema, 
  initialValues = {}, 
  events,
  disabled = false,
  testID
}, ref) => {
  // Internal state management
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  
  // Track initial values to determine dirty state
  const initialValuesRef = useRef(initialValues);
  
  // Memoized validation state
  const validationState = useMemo(() => ({
    isValid,
    errors,
    hasErrors: Object.keys(errors).length > 0
  }), [isValid, errors]);

  // Check if form is dirty (values changed from initial)
  const checkDirtyState = useCallback((currentValues: Record<string, any>) => {
    const isDirtyState = JSON.stringify(currentValues) !== JSON.stringify(initialValuesRef.current);
    setIsDirty(isDirtyState);
    return isDirtyState;
  }, []);

  // Optimized field value change handler
  const handleChange = useCallback((id: string, value: any) => {
    setValues((prev) => {
      const newValues = { ...prev, [id]: value };
      
      // Check dirty state
      checkDirtyState(newValues);
      
      // Trigger change event
      events?.change?.(newValues);
      
      return newValues;
    });
  }, [events, checkDirtyState]);

  // Field focus handler
  const handleFieldFocus = useCallback((fieldId: string) => {
    events?.fieldFocus?.(fieldId);
  }, [events]);

  // Field blur handler
  const handleFieldBlur = useCallback((fieldId: string) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
    events?.fieldBlur?.(fieldId);
  }, [events]);

  // Basic validation function (will be enhanced in validation engine task)
  const validateForm = useCallback(async (): Promise<ValidationResult> => {
    const formErrors: ValidationErrors = {};
    let formIsValid = true;

    // Basic required field validation
    for (const field of schema.fields) {
      const fieldErrors: string[] = [];
      const fieldValue = values[field.id];
      
      // Check required fields
      if (field.required && (!fieldValue || fieldValue === '')) {
        fieldErrors.push(`${field.label} is required`);
        formIsValid = false;
      }
      
      if (fieldErrors.length > 0) {
        formErrors[field.id] = fieldErrors;
      }
    }

    setErrors(formErrors);
    setIsValid(formIsValid);
    
    const result: ValidationResult = {
      isValid: formIsValid,
      errors: formErrors
    };

    // Trigger validation change event
    events?.validationChange?.(formIsValid, formErrors);
    
    return result;
  }, [schema.fields, values, events]);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate form before submission
      const validationResult = await validateForm();
      
      if (validationResult.isValid) {
        await events?.submit?.(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateForm, events, values]);

  // Form reset handler
  const handleReset = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
    setIsValid(true);
    
    events?.reset?.();
  }, [events]);

  // Expose form methods via ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: handleReset,
    validate: validateForm,
    setFieldValue: (fieldId: string, value: any) => {
      handleChange(fieldId, value);
    },
    getFieldValue: (fieldId: string) => values[fieldId],
    getValues: () => values,
    setValues: (newValues: Partial<Record<string, any>>) => {
      setValues(prev => {
        const updatedValues = { ...prev, ...newValues };
        checkDirtyState(updatedValues);
        events?.change?.(updatedValues);
        return updatedValues;
      });
    },
    focus: (fieldId: string) => {
      handleFieldFocus(fieldId);
    },
    blur: (fieldId: string) => {
      handleFieldBlur(fieldId);
    },
    isValid: () => isValid,
    isDirty: () => isDirty,
    isTouched: (fieldId?: string) => {
      if (fieldId) {
        return touched[fieldId] || false;
      }
      return Object.keys(touched).length > 0;
    }
  }), [handleSubmit, handleReset, validateForm, handleChange, values, checkDirtyState, events, handleFieldFocus, handleFieldBlur, isValid, isDirty, touched]);

  // Lifecycle effects
  useEffect(() => {
    events?.mount?.();
    return () => {
      events?.unmount?.();
    };
  }, [events]);

  // Update initial values when prop changes
  useEffect(() => {
    if (JSON.stringify(initialValues) !== JSON.stringify(initialValuesRef.current)) {
      initialValuesRef.current = initialValues;
      setValues(initialValues);
      setIsDirty(false);
    }
  }, [initialValues]);

  const renderField = (field: any) => {
    const fieldValue = values[field.id] ?? field.defaultValue ?? "";
    const fieldErrors = errors[field.id];
    const isFieldTouched = touched[field.id];
    const isFieldDisabled = disabled || field.disabled;
    const hasError = fieldErrors && fieldErrors.length > 0;

    const commonProps = {
      value: fieldValue,
      onChangeText: (val: any) => handleChange(field.id, val),
      onFocus: () => handleFieldFocus(field.id),
      onBlur: () => handleFieldBlur(field.id),
      editable: !isFieldDisabled && !field.readonly,
      style: {
        borderWidth: 1,
        borderColor: hasError && isFieldTouched ? "#ff4444" : "#ccc",
        borderRadius: 6,
        padding: 8,
        opacity: isFieldDisabled ? 0.6 : 1,
        backgroundColor: field.readonly ? "#f5f5f5" : "white"
      }
    };

    switch (field.type) {
      case "text":
      case "email":
        return (
          <View key={field.id}>
            <TextInput
              placeholder={field.placeholder}
              keyboardType={field.type === "email" ? "email-address" : "default"}
              autoCapitalize={field.autoCapitalize || "sentences"}
              autoCorrect={field.autoCorrect !== false}
              maxLength={field.maxLength}
              {...commonProps}
            />
            {hasError && isFieldTouched && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>
                {fieldErrors.join(", ")}
              </Text>
            )}
          </View>
        );
      case "password":
        return (
          <View key={field.id}>
            <TextInput
              placeholder={field.placeholder}
              secureTextEntry
              maxLength={field.maxLength}
              {...commonProps}
            />
            {hasError && isFieldTouched && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>
                {fieldErrors.join(", ")}
              </Text>
            )}
          </View>
        );
      case "number":
        return (
          <View key={field.id}>
            <TextInput
              placeholder={field.placeholder}
              keyboardType="numeric"
              value={fieldValue?.toString() ?? ""}
              onChangeText={(val) => {
                const numValue = parseFloat(val);
                handleChange(field.id, isNaN(numValue) ? "" : numValue);
              }}
              onFocus={() => handleFieldFocus(field.id)}
              onBlur={() => handleFieldBlur(field.id)}
              editable={!isFieldDisabled && !field.readonly}
              style={{
                borderWidth: 1,
                borderColor: hasError && isFieldTouched ? "#ff4444" : "#ccc",
                borderRadius: 6,
                padding: 8,
                opacity: isFieldDisabled ? 0.6 : 1,
                backgroundColor: field.readonly ? "#f5f5f5" : "white"
              }}
            />
            {hasError && isFieldTouched && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>
                {fieldErrors.join(", ")}
              </Text>
            )}
          </View>
        );
      case "textarea":
        return (
          <View key={field.id}>
            <TextInput
              placeholder={field.placeholder}
              multiline
              numberOfLines={field.rows || 4}
              maxLength={field.maxLength}
              {...commonProps}
              style={{
                ...commonProps.style,
                minHeight: (field.rows || 4) * 20,
                textAlignVertical: "top"
              }}
            />
            {hasError && isFieldTouched && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>
                {fieldErrors.join(", ")}
              </Text>
            )}
          </View>
        );
      default:
        return (
          <Text key={field.id} style={{ color: "#999" }}>
            Field type "{field.type}" not implemented yet
          </Text>
        );
    }
  };

  return (
    <View testID={testID} style={{ opacity: disabled ? 0.6 : 1 }}>
      {schema.title && (
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
          {schema.title}
        </Text>
      )}
      
      {schema.description && (
        <Text style={{ marginBottom: 16, color: "#666" }}>
          {schema.description}
        </Text>
      )}

      {schema.fields.map((field) => (
        <View key={field.id} style={{ marginBottom: schema.layout?.spacing || 12 }}>
          <Text style={{ marginBottom: 4, fontWeight: field.required ? "bold" : "normal" }}>
            {field.label}
            {field.required && <Text style={{ color: "red" }}> *</Text>}
          </Text>
          
          {field.description && (
            <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              {field.description}
            </Text>
          )}
          
          {renderField(field)}
        </View>
      ))}

      <View style={{ marginTop: 20, flexDirection: "row", gap: 10 }}>
        <Button
          title="Submit"
          onPress={handleSubmit}
          disabled={disabled || isSubmitting || !isValid}
          testID="form-submit-button"
        />
        <Button
          title="Reset"
          onPress={handleReset}
          disabled={disabled || isSubmitting}
          color="#666"
          testID="form-reset-button"
        />
      </View>
      
      {/* Form state indicators for debugging */}
      {__DEV__ && (
        <View style={{ marginTop: 10, padding: 8, backgroundColor: "#f0f0f0", borderRadius: 4 }}>
          <Text style={{ fontSize: 10, color: "#666" }}>
            Valid: {isValid ? "✓" : "✗"} | Dirty: {isDirty ? "✓" : "✗"} | Submitting: {isSubmitting ? "✓" : "✗"}
          </Text>
        </View>
      )}
    </View>
  );
});

Form.displayName = 'Form';
