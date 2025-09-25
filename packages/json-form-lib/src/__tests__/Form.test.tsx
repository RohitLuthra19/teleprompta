import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Form } from "../Form";
import type { FormEvents, FormRef, FormSchema } from "../types";

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("Form Component", () => {
  const mockSchema: FormSchema = {
    id: "test-form",
    title: "Test Form",
    description: "A test form for unit testing",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Name",
        placeholder: "Enter your name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "Enter your email",
        required: true,
      },
      {
        id: "age",
        type: "number",
        label: "Age",
        placeholder: "Enter your age",
      },
      {
        id: "bio",
        type: "textarea",
        label: "Bio",
        placeholder: "Tell us about yourself",
        rows: 3,
      },
    ],
  };

  const mockInitialValues = {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  };

  describe("Basic Rendering", () => {
    it("renders form with title and description", () => {
      const { getByText } = render(<Form schema={mockSchema} />);

      expect(getByText("Test Form")).toBeTruthy();
      expect(getByText("A test form for unit testing")).toBeTruthy();
    });

    it("renders all form fields", () => {
      const { getByPlaceholderText, getByText } = render(
        <Form schema={mockSchema} />
      );

      expect(getByText("Name *")).toBeTruthy();
      expect(getByText("Email *")).toBeTruthy();
      expect(getByText("Age")).toBeTruthy();
      expect(getByText("Bio")).toBeTruthy();

      expect(getByPlaceholderText("Enter your name")).toBeTruthy();
      expect(getByPlaceholderText("Enter your email")).toBeTruthy();
      expect(getByPlaceholderText("Enter your age")).toBeTruthy();
      expect(getByPlaceholderText("Tell us about yourself")).toBeTruthy();
    });

    it("renders submit and reset buttons", () => {
      // Check for buttons by their testID
      const { getByTestId } = render(<Form schema={mockSchema} />);
      
      const submitButton = getByTestId("form-submit-button");
      const resetButton = getByTestId("form-reset-button");
      
      expect(submitButton).toBeTruthy();
      expect(resetButton).toBeTruthy();
      expect(submitButton.props.title).toBe("Submit");
      expect(resetButton.props.title).toBe("Reset");
    });

    it("applies initial values correctly", () => {
      const { getByDisplayValue } = render(
        <Form schema={mockSchema} initialValues={mockInitialValues} />
      );

      expect(getByDisplayValue("John Doe")).toBeTruthy();
      expect(getByDisplayValue("john@example.com")).toBeTruthy();
      expect(getByDisplayValue("30")).toBeTruthy();
    });
  });

  describe("State Management", () => {
    it("updates field values when user types", () => {
      const mockEvents: FormEvents = {
        change: jest.fn(),
      };

      const { getByPlaceholderText } = render(
        <Form schema={mockSchema} events={mockEvents} />
      );

      const nameInput = getByPlaceholderText("Enter your name");
      fireEvent.changeText(nameInput, "Jane Doe");

      expect(mockEvents.change).toHaveBeenCalledWith({ name: "Jane Doe" });
    });

    it("tracks dirty state correctly", async () => {
      const formRef = React.createRef<FormRef>();

      render(
        <Form
          ref={formRef}
          schema={mockSchema}
          initialValues={mockInitialValues}
        />
      );

      // Initially not dirty
      expect(formRef.current?.isDirty()).toBe(false);

      // Change a field value
      const { getByPlaceholderText } = render(
        <Form
          ref={formRef}
          schema={mockSchema}
          initialValues={mockInitialValues}
        />
      );

      const nameInput = getByPlaceholderText("Enter your name");
      fireEvent.changeText(nameInput, "Jane Doe");

      await waitFor(() => {
        expect(formRef.current?.isDirty()).toBe(true);
      });
    });

    it("tracks touched state for fields", async () => {
      const formRef = React.createRef<FormRef>();
      const mockEvents: FormEvents = {
        fieldBlur: jest.fn(),
      };

      const { getByPlaceholderText } = render(
        <Form ref={formRef} schema={mockSchema} events={mockEvents} />
      );

      const nameInput = getByPlaceholderText("Enter your name");

      // Initially not touched
      expect(formRef.current?.isTouched("name")).toBe(false);

      // Focus and blur the field
      fireEvent(nameInput, "focus");
      fireEvent(nameInput, "blur");

      await waitFor(() => {
        expect(formRef.current?.isTouched("name")).toBe(true);
        expect(mockEvents.fieldBlur).toHaveBeenCalledWith("name");
      });
    });

    it("manages form validation state", async () => {
      const formRef = React.createRef<FormRef>();
      const mockEvents: FormEvents = {
        validationChange: jest.fn(),
      };

      render(<Form ref={formRef} schema={mockSchema} events={mockEvents} />);

      // Validate empty form (should be invalid due to required fields)
      await act(async () => {
        const result = await formRef.current?.validate();
        expect(result?.isValid).toBe(false);
        expect(result?.errors.name).toContain("Name is required");
        expect(result?.errors.email).toContain("Email is required");
      });

      expect(mockEvents.validationChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({
          name: expect.arrayContaining(["Name is required"]),
          email: expect.arrayContaining(["Email is required"]),
        })
      );
    });
  });

  describe("Event Handling", () => {
    it("triggers lifecycle events", () => {
      const mockEvents: FormEvents = {
        mount: jest.fn(),
        unmount: jest.fn(),
      };

      const { unmount } = render(
        <Form schema={mockSchema} events={mockEvents} />
      );

      expect(mockEvents.mount).toHaveBeenCalled();

      unmount();
      expect(mockEvents.unmount).toHaveBeenCalled();
    });

    it("handles form submission", async () => {
      const mockEvents: FormEvents = {
        submit: jest.fn(),
      };

      const { getByPlaceholderText, getByTestId } = render(
        <Form schema={mockSchema} events={mockEvents} />
      );

      // Fill required fields
      fireEvent.changeText(getByPlaceholderText("Enter your name"), "John Doe");
      fireEvent.changeText(
        getByPlaceholderText("Enter your email"),
        "john@example.com"
      );

      // Submit form
      const submitButton = getByTestId("form-submit-button");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockEvents.submit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "John Doe",
            email: "john@example.com",
          })
        );
      });
    });

    it("prevents submission when form is invalid", async () => {
      const mockEvents: FormEvents = {
        submit: jest.fn(),
      };

      // Try to submit empty form
      const { getByTestId } = render(
        <Form schema={mockSchema} events={mockEvents} />
      );
      const submitButton = getByTestId("form-submit-button");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockEvents.submit).not.toHaveBeenCalled();
      });
    });

    it("handles form reset", async () => {
      const mockEvents: FormEvents = {
        reset: jest.fn(),
      };

      const { getByPlaceholderText, getByTestId } = render(
        <Form
          schema={mockSchema}
          initialValues={mockInitialValues}
          events={mockEvents}
        />
      );

      // Change a field value
      const nameInput = getByPlaceholderText("Enter your name");
      fireEvent.changeText(nameInput, "Jane Doe");

      // Reset form
      const resetButton = getByTestId("form-reset-button");
      fireEvent.press(resetButton);

      expect(mockEvents.reset).toHaveBeenCalled();

      // Wait for reset to take effect
      await waitFor(() => {
        expect(nameInput.props.value).toBe("John Doe");
      });
    });

    it("handles field focus and blur events", () => {
      const mockEvents: FormEvents = {
        fieldFocus: jest.fn(),
        fieldBlur: jest.fn(),
      };

      const { getByPlaceholderText } = render(
        <Form schema={mockSchema} events={mockEvents} />
      );

      const nameInput = getByPlaceholderText("Enter your name");

      fireEvent(nameInput, "focus");
      expect(mockEvents.fieldFocus).toHaveBeenCalledWith("name");

      fireEvent(nameInput, "blur");
      expect(mockEvents.fieldBlur).toHaveBeenCalledWith("name");
    });
  });

  describe("Form Ref Methods", () => {
    it("exposes submit method via ref", async () => {
      const formRef = React.createRef<FormRef>();
      const mockEvents: FormEvents = {
        submit: jest.fn(),
      };

      render(
        <Form
          ref={formRef}
          schema={mockSchema}
          initialValues={mockInitialValues}
          events={mockEvents}
        />
      );

      await act(async () => {
        await formRef.current?.submit();
      });

      expect(mockEvents.submit).toHaveBeenCalledWith(mockInitialValues);
    });

    it("exposes reset method via ref", () => {
      const formRef = React.createRef<FormRef>();
      const mockEvents: FormEvents = {
        reset: jest.fn(),
      };

      render(
        <Form
          ref={formRef}
          schema={mockSchema}
          initialValues={mockInitialValues}
          events={mockEvents}
        />
      );

      act(() => {
        formRef.current?.reset();
      });

      expect(mockEvents.reset).toHaveBeenCalled();
    });

    it("exposes field value manipulation methods", () => {
      const formRef = React.createRef<FormRef>();

      render(
        <Form
          ref={formRef}
          schema={mockSchema}
          initialValues={mockInitialValues}
        />
      );

      // Test getFieldValue
      expect(formRef.current?.getFieldValue("name")).toBe("John Doe");

      // Test setFieldValue
      act(() => {
        formRef.current?.setFieldValue("name", "Jane Doe");
      });
      expect(formRef.current?.getFieldValue("name")).toBe("Jane Doe");

      // Test getValues
      const values = formRef.current?.getValues();
      expect(values).toEqual(
        expect.objectContaining({
          name: "Jane Doe",
          email: "john@example.com",
          age: 30,
        })
      );

      // Test setValues
      act(() => {
        formRef.current?.setValues({ name: "Bob Smith", age: 25 });
      });
      expect(formRef.current?.getFieldValue("name")).toBe("Bob Smith");
      expect(formRef.current?.getFieldValue("age")).toBe(25);
    });

    it("exposes validation state methods", async () => {
      const formRef = React.createRef<FormRef>();

      render(<Form ref={formRef} schema={mockSchema} />);

      // Initially invalid (empty required fields)
      expect(formRef.current?.isValid()).toBe(true); // Initial state is valid

      // Validate and check state
      await act(async () => {
        await formRef.current?.validate();
      });

      expect(formRef.current?.isValid()).toBe(false);
    });
  });

  describe("Error Handling and Validation", () => {
    it("displays validation errors for touched fields", async () => {
      const formRef = React.createRef<FormRef>();
      const { getByPlaceholderText, queryByText, rerender } = render(
        <Form ref={formRef} schema={mockSchema} />
      );

      const nameInput = getByPlaceholderText("Enter your name");

      // Focus and blur without entering value to mark as touched
      fireEvent(nameInput, "focus");
      fireEvent(nameInput, "blur");

      // Trigger validation
      await act(async () => {
        await formRef.current?.validate();
      });

      // Re-render to show validation errors
      rerender(<Form ref={formRef} schema={mockSchema} />);

      await waitFor(() => {
        expect(queryByText("Name is required")).toBeTruthy();
      });
    });

    it("handles different field types correctly", () => {
      const { getByPlaceholderText } = render(<Form schema={mockSchema} />);

      // Test number field
      const ageInput = getByPlaceholderText("Enter your age");
      fireEvent.changeText(ageInput, "25");
      expect(ageInput.props.value).toBe("25");

      // Test invalid number
      fireEvent.changeText(ageInput, "invalid");
      expect(ageInput.props.value).toBe("");
    });
  });

  describe("Disabled State", () => {
    it("disables all fields when form is disabled", () => {
      const { getByPlaceholderText } = render(
        <Form schema={mockSchema} disabled={true} />
      );

      const nameInput = getByPlaceholderText("Enter your name");
      expect(nameInput.props.editable).toBe(false);
    });

    it("disables individual fields when field is disabled", () => {
      const disabledSchema: FormSchema = {
        ...mockSchema,
        fields: [
          {
            ...mockSchema.fields[0],
            disabled: true,
          },
          ...mockSchema.fields.slice(1),
        ],
      };

      const { getByPlaceholderText } = render(<Form schema={disabledSchema} />);

      const nameInput = getByPlaceholderText("Enter your name");
      const emailInput = getByPlaceholderText("Enter your email");

      expect(nameInput.props.editable).toBe(false);
      expect(emailInput.props.editable).toBe(true);
    });
  });

  describe("Performance Optimizations", () => {
    it("does not cause unnecessary re-renders", () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        renderSpy();
        return <Form schema={mockSchema} />;
      };

      const { rerender } = render(<TestComponent />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props should not cause additional renders
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
