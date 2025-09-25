import { Box, Button, ButtonText, Text } from "@/components/ui/";
import * as React from "react";
import { registerBuiltInFieldComponents } from "../components/fields";
import { fieldRenderer } from "./FieldRenderer";
import type {
    FormProps,
    FormRef,
    ParsedField,
    RenderContext,
    ValidationErrors,
    ValidationResult,
} from "./types";

export const Form = React.forwardRef<FormRef, FormProps>(
  ({ schema, initialValues = {}, events, disabled = false, testID }, ref) => {
    // Initialize built-in field components on first render
    const [isInitialized, setIsInitialized] = React.useState(false);

    React.useEffect(() => {
      if (!isInitialized) {
        registerBuiltInFieldComponents();
        setIsInitialized(true);
      }
    }, [isInitialized]);

    // Internal state management
    const [values, setValues] =
      React.useState<Record<string, any>>(initialValues);
    const [errors, setErrors] = React.useState<ValidationErrors>({});
    const [touched, setTouched] = React.useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isValid, setIsValid] = React.useState(false);
    const [isDirty, setIsDirty] = React.useState(false);
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    // Track initial values to determine dirty state
    const initialValuesRef = React.useRef(initialValues);

    // Memoized validation state
    const validationState = React.useMemo(
      () => ({
        isValid,
        errors,
        hasErrors: Object.keys(errors).length > 0,
      }),
      [isValid, errors]
    );

    // Check if form is dirty (values changed from initial)
    const checkDirtyState = React.useCallback(
      (currentValues: Record<string, any>) => {
        const isDirtyState =
          JSON.stringify(currentValues) !==
          JSON.stringify(initialValuesRef.current);
        setIsDirty(isDirtyState);
        return isDirtyState;
      },
      []
    );

    // Optimized field value change handler
    const handleChange = React.useCallback(
      (id: string, value: any) => {
        setValues((prev) => {
          const newValues = { ...prev, [id]: value };

          // Check dirty state
          checkDirtyState(newValues);

          // Trigger change event
          events?.change?.(newValues);

          return newValues;
        });

        // Clear field error when user starts typing
        setErrors((prev) => {
          if (prev[id]) {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
          }
          return prev;
        });

        // Silent validation to update isValid state without showing errors
        setTimeout(() => {
          let formIsValid = true;
          for (const field of schema.fields) {
            const fieldValue =
              values[field.id] === id ? value : values[field.id];
            if (field.required && (!fieldValue || fieldValue === "")) {
              formIsValid = false;
              break;
            }
          }
          setIsValid(formIsValid);
        }, 0);
      },
      [events, checkDirtyState, schema.fields, values]
    );

    // Field focus handler
    const handleFieldFocus = React.useCallback(
      (fieldId: string) => {
        events?.fieldFocus?.(fieldId);
      },
      [events]
    );

    // Field blur handler
    const handleFieldBlur = React.useCallback(
      (fieldId: string) => {
        setTouched((prev) => ({ ...prev, [fieldId]: true }));
        events?.fieldBlur?.(fieldId);
      },
      [events]
    );

    // Basic validation function (will be enhanced in validation engine task)
    const validateForm =
      React.useCallback(async (): Promise<ValidationResult> => {
        const formErrors: ValidationErrors = {};
        let formIsValid = true;

        // Basic required field validation
        for (const field of schema.fields) {
          const fieldErrors: string[] = [];
          const fieldValue = values[field.id];

          // Check required fields
          if (field.required && (!fieldValue || fieldValue === "")) {
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
          errors: formErrors,
        };

        // Trigger validation change event
        events?.validationChange?.(formIsValid, formErrors);

        return result;
      }, [schema.fields, values, events]);

    // Form submission handler
    const handleSubmit = React.useCallback(async () => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setHasSubmitted(true); // Mark form as submitted to show errors

      try {
        // Validate form before submission
        const validationResult = await validateForm();

        if (validationResult.isValid) {
          await events?.submit?.(values);
        }
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }, [isSubmitting, validateForm, events, values]);

    // Form reset handler
    const handleReset = React.useCallback(() => {
      setValues(initialValuesRef.current);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setIsDirty(false);
      setIsValid(true);
      setHasSubmitted(false); // Reset submitted state

      events?.reset?.();
    }, [events]);

    // Expose form methods via ref
    React.useImperativeHandle(
      ref,
      () => ({
        submit: handleSubmit,
        reset: handleReset,
        validate: validateForm,
        setFieldValue: (fieldId: string, value: any) => {
          handleChange(fieldId, value);
        },
        getFieldValue: (fieldId: string) => values[fieldId],
        getValues: () => values,
        setValues: (newValues: Partial<Record<string, any>>) => {
          setValues((prev) => {
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
        },
      }),
      [
        handleSubmit,
        handleReset,
        validateForm,
        handleChange,
        values,
        checkDirtyState,
        events,
        handleFieldFocus,
        handleFieldBlur,
        isValid,
        isDirty,
        touched,
      ]
    );

    // Initial validation on mount (silent - no error display)
    React.useEffect(() => {
      // Perform initial validation to set the correct isValid state but don't show errors
      const silentValidate = async () => {
        const formErrors: ValidationErrors = {};
        let formIsValid = true;

        for (const field of schema.fields) {
          const fieldValue = values[field.id];
          if (field.required && (!fieldValue || fieldValue === "")) {
            formIsValid = false;
            // Don't set errors here - just update isValid state
          }
        }

        setIsValid(formIsValid);
      };

      silentValidate();
    }, [schema.fields, values]);

    // Lifecycle effects
    React.useEffect(() => {
      events?.mount?.();
      return () => {
        events?.unmount?.();
      };
    }, [events]);

    // Update initial values when prop changes
    React.useEffect(() => {
      if (
        JSON.stringify(initialValues) !==
        JSON.stringify(initialValuesRef.current)
      ) {
        initialValuesRef.current = initialValues;
        setValues(initialValues);
        setIsDirty(false);
      }
    }, [initialValues]);

    // Create render context for field renderer
    const renderContext: RenderContext = React.useMemo(
      () => ({
        values,
        errors,
        touched,
        isSubmitting,
        disabled,
        isValid,
        isDirty,
        hasSubmitted,
        onChange: handleChange,
        onBlur: handleFieldBlur,
        onFocus: handleFieldFocus,
      }),
      [
        values,
        errors,
        touched,
        isSubmitting,
        disabled,
        isValid,
        isDirty,
        hasSubmitted,
        handleChange,
        handleFieldBlur,
        handleFieldFocus,
      ]
    );

    // Render a single field using the field renderer
    const renderField = (field: any) => {
      // Convert field to ParsedField format (simplified for now)
      const parsedField: ParsedField = {
        field,
        _parsed: {
          dependencies: [],
          conditionalRules: [],
          validationSchema: undefined,
        },
      };

      // Render field using the field renderer
      return fieldRenderer.render(parsedField, renderContext);
    };

    return (
      <Box testID={testID} style={{ opacity: disabled ? 0.6 : 1 }}>
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
          <Box key={field.id}>{renderField(field)}</Box>
        ))}

        <Box style={{ marginTop: 20, flexDirection: "row", gap: 10 }}>
          <Button
            variant="solid"
            size="lg"
            action="primary"
            onPress={handleSubmit}
            disabled={disabled || isSubmitting}
            testID="form-submit-button"
          >
            <ButtonText>Submit</ButtonText>
          </Button>
          <Button
            variant="solid"
            size="lg"
            action="secondary"
            onPress={handleReset}
            disabled={disabled || isSubmitting}
            testID="form-reset-button"
          >
            <ButtonText>Reset</ButtonText>
          </Button>
        </Box>

        {/* Form state indicators for debugging */}
        {__DEV__ && (
          <Box
            style={{
              marginTop: 10,
              padding: 8,
              backgroundColor: "#f0f0f0",
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 10, color: "#666" }}>
              Valid: {isValid ? "✓" : "✗"} | Dirty: {isDirty ? "✓" : "✗"} |
              Submitting: {isSubmitting ? "✓" : "✗"}
            </Text>
          </Box>
        )}
      </Box>
    );
  }
);

Form.displayName = "Form";
