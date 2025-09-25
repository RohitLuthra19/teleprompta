import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FieldWrapper } from '../../components/FieldWrapper';
import type { BaseField } from '../../types';

describe('FieldWrapper', () => {
  const mockField: BaseField = {
    id: 'test-field',
    type: 'text',
    label: 'Test Field',
    description: 'This is a test field',
    required: false
  };

  const MockChildComponent = () => <Text testID="child-component">Child Content</Text>;

  it('should render field label', () => {
    const { getByText } = render(
      <FieldWrapper field={mockField} error={[]} touched={false} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(getByText('Test Field')).toBeTruthy();
  });

  it('should render field description', () => {
    const { getByText } = render(
      <FieldWrapper field={mockField} error={[]} touched={false} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(getByText('This is a test field')).toBeTruthy();
  });

  it('should render required indicator for required fields', () => {
    const requiredField = { ...mockField, required: true };
    
    const { getByText } = render(
      <FieldWrapper field={requiredField} error={[]} touched={false} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(getByText('*', { exact: false })).toBeTruthy();
  });

  it('should not render required indicator for optional fields', () => {
    const { queryByText } = render(
      <FieldWrapper field={mockField} error={[]} touched={false} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(queryByText('*', { exact: false })).toBeFalsy();
  });

  it('should render error messages when field is touched and has errors', () => {
    const errors = ['This field is required', 'Invalid format'];
    
    const { getByText } = render(
      <FieldWrapper field={mockField} error={errors} touched={true} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(getByText('This field is required')).toBeTruthy();
    expect(getByText('Invalid format')).toBeTruthy();
  });

  it('should not render error messages when field is not touched', () => {
    const errors = ['This field is required'];
    
    const { queryByText } = render(
      <FieldWrapper field={mockField} error={errors} touched={false} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(queryByText('This field is required')).toBeFalsy();
  });

  it('should not render error messages when field has no errors', () => {
    const { queryByRole } = render(
      <FieldWrapper field={mockField} error={[]} touched={true} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(queryByRole('alert')).toBeFalsy();
  });

  it('should render readonly indicator for readonly fields', () => {
    const readonlyField = { ...mockField, readonly: true };
    
    const { getByText } = render(
      <FieldWrapper field={readonlyField} error={[]} touched={false} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(getByText('Read-only')).toBeTruthy();
  });

  it('should apply disabled opacity when disabled', () => {
    const { getByTestId } = render(
      <FieldWrapper field={mockField} error={[]} touched={false} disabled={true} testID="wrapper">
        <MockChildComponent />
      </FieldWrapper>
    );

    const wrapper = getByTestId('wrapper');
    expect(wrapper.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opacity: 0.6
        })
      ])
    );
  });

  it('should apply normal opacity when not disabled', () => {
    const { getByTestId } = render(
      <FieldWrapper field={mockField} error={[]} touched={false} disabled={false} testID="wrapper">
        <MockChildComponent />
      </FieldWrapper>
    );

    const wrapper = getByTestId('wrapper');
    expect(wrapper.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opacity: 1
        })
      ])
    );
  });

  it('should render child components', () => {
    const { getByTestId } = render(
      <FieldWrapper field={mockField} error={[]} touched={false} disabled={false}>
        <MockChildComponent />
      </FieldWrapper>
    );

    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    
    const { getByTestId } = render(
      <FieldWrapper 
        field={mockField} 
        error={[]} 
        touched={false} 
        disabled={false}
        style={customStyle}
        testID="wrapper"
      >
        <MockChildComponent />
      </FieldWrapper>
    );

    const wrapper = getByTestId('wrapper');
    expect(wrapper.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('should apply field styles from field configuration', () => {
    const fieldWithStyle = { 
      ...mockField, 
      style: { backgroundColor: 'blue' } 
    };
    
    const { getByTestId } = render(
      <FieldWrapper 
        field={fieldWithStyle} 
        error={[]} 
        touched={false} 
        disabled={false}
        testID="wrapper"
      >
        <MockChildComponent />
      </FieldWrapper>
    );

    const wrapper = getByTestId('wrapper');
    expect(wrapper.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'blue' })
      ])
    );
  });

  describe('Accessibility', () => {
    it('should provide correct accessibility attributes', () => {
      const { getByTestId } = render(
        <FieldWrapper field={mockField} error={[]} touched={false} disabled={false} testID="wrapper">
          <MockChildComponent />
        </FieldWrapper>
      );

      const wrapper = getByTestId('wrapper');
      expect(wrapper.props.accessibilityLabel).toBe('Test Field');
      expect(wrapper.props.accessibilityHint).toBe('This is a test field');
      expect(wrapper.props.accessibilityRequired).toBe(false);
      expect(wrapper.props.accessibilityInvalid).toBe(false);
    });

    it('should indicate required fields in accessibility attributes', () => {
      const requiredField = { ...mockField, required: true };
      
      const { getByTestId } = render(
        <FieldWrapper field={requiredField} error={[]} touched={false} disabled={false} testID="wrapper">
          <MockChildComponent />
        </FieldWrapper>
      );

      const wrapper = getByTestId('wrapper');
      expect(wrapper.props.accessibilityRequired).toBe(true);
    });

    it('should indicate invalid fields in accessibility attributes', () => {
      const errors = ['This field is required'];
      
      const { getByTestId } = render(
        <FieldWrapper field={mockField} error={errors} touched={true} disabled={false} testID="wrapper">
          <MockChildComponent />
        </FieldWrapper>
      );

      const wrapper = getByTestId('wrapper');
      expect(wrapper.props.accessibilityInvalid).toBe(true);
    });

    it('should provide alert role for error messages', () => {
      const errors = ['This field is required'];
      
      const { getByRole } = render(
        <FieldWrapper field={mockField} error={errors} touched={true} disabled={false}>
          <MockChildComponent />
        </FieldWrapper>
      );

      const { getByTestId: getTestId } = render(
        <FieldWrapper field={mockField} error={errors} touched={true} disabled={false}>
          <MockChildComponent />
        </FieldWrapper>
      );
      
      const alertElement = getTestId('field-test-field').children[2]; // Error container is the 3rd child
      expect(alertElement.props.accessibilityRole).toBe('alert');
      expect(alertElement.props.accessibilityLiveRegion).toBe('polite');
    });

    it('should use custom testID when provided', () => {
      const { getByTestId } = render(
        <FieldWrapper field={mockField} error={[]} touched={false} disabled={false} testID="custom-test-id">
          <MockChildComponent />
        </FieldWrapper>
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });

    it('should generate default testID from field ID', () => {
      const { getByTestId } = render(
        <FieldWrapper field={mockField} error={[]} touched={false} disabled={false}>
          <MockChildComponent />
        </FieldWrapper>
      );

      expect(getByTestId('field-test-field')).toBeTruthy();
    });
  });
});