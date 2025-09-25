import React from "react";
import { ViewStyle } from "react-native";
import { z } from "zod";



// ============================================================================
// ENHANCED TYPE SYSTEM
// ============================================================================

// Field Types
export type FieldType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "slider"
  | "rating"
  | "color"
  | "array"
  | "object"
  | "custom";

// Base Field Interface
export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  conditional?: ConditionalConfig;
  className?: string;
  style?: ViewStyle;
}

// Specific Field Types
export interface TextField extends BaseField {
  type: "text" | "password" | "email";
  maxLength?: number;
  minLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
}

export interface TextAreaField extends BaseField {
  type: "textarea";
  rows?: number;
  maxLength?: number;
  minLength?: number;
  autoGrow?: boolean;
}

export interface NumberField extends BaseField {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  format?: "integer" | "decimal" | "currency" | "percentage";
}

export interface SelectField extends BaseField {
  type: "select" | "multiselect";
  options: SelectOption[] | DynamicOptionsConfig;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxSelections?: number;
}

export interface RadioField extends BaseField {
  type: "radio";
  options: SelectOption[];
  layout?: "vertical" | "horizontal";
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  options?: SelectOption[]; // For checkbox groups
  indeterminate?: boolean;
}

export interface SwitchField extends BaseField {
  type: "switch";
  onLabel?: string;
  offLabel?: string;
}

export interface DateField extends BaseField {
  type: "date" | "time" | "datetime";
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  locale?: string;
  showCalendar?: boolean;
}

export interface SliderField extends BaseField {
  type: "slider";
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  showTicks?: boolean;
  marks?: Array<{ value: number; label: string }>;
}

export interface RatingField extends BaseField {
  type: "rating";
  max: number;
  allowHalf?: boolean;
  icon?: string;
  emptyIcon?: string;
  size?: "small" | "medium" | "large";
}

export interface FileField extends BaseField {
  type: "file";
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

export interface ArrayField extends BaseField {
  type: "array";
  itemSchema: Field;
  minItems?: number;
  maxItems?: number;
  addLabel?: string;
  removeLabel?: string;
}

export interface ObjectField extends BaseField {
  type: "object";
  fields: Field[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface CustomField extends BaseField {
  type: "custom";
  component: string;
  props?: Record<string, any>;
}

// Union type for all field types
export type Field =
  | TextField
  | TextAreaField
  | NumberField
  | SelectField
  | RadioField
  | CheckboxField
  | SwitchField
  | DateField
  | SliderField
  | RatingField
  | FileField
  | ArrayField
  | ObjectField
  | CustomField;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface FieldValidation {
  required?: boolean | ConditionalRule;
  schema?: z.ZodSchema;
  regex?: RegExp;
  custom?: CustomValidationRule[];
  async?: AsyncValidationRule[];
  debounceMs?: number;
}

export interface CustomValidationRule {
  name: string;
  message: string;
  validator: (value: any, allValues: Record<string, any>) => boolean | string;
}

export interface AsyncValidationRule {
  name: string;
  message: string;
  validator: (
    value: any,
    allValues: Record<string, any>
  ) => Promise<boolean | string>;
  debounceMs?: number;
}

export interface GlobalValidation {
  schema?: z.ZodSchema;
  customRules?: CustomValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  warnings?: ValidationWarnings;
}

export interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationErrors {
  [fieldId: string]: string[];
}

export interface ValidationWarnings {
  [fieldId: string]: string[];
}

// ============================================================================
// CONDITIONAL RENDERING TYPES
// ============================================================================

export interface ConditionalConfig {
  show?: ConditionalRule[];
  hide?: ConditionalRule[];
  enable?: ConditionalRule[];
  disable?: ConditionalRule[];
  require?: ConditionalRule[];
}

export interface ConditionalRule {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "greater_than_or_equal"
    | "less_than_or_equal"
    | "in"
    | "not_in"
    | "is_empty"
    | "is_not_empty"
    | "custom";
  value?: any;
  customRule?: (fieldValue: any, allValues: Record<string, any>) => boolean;
}

export interface DependencyGraph {
  [fieldId: string]: string[]; // fieldId -> array of dependent field IDs
}

// ============================================================================
// DYNAMIC OPTIONS TYPES
// ============================================================================

export interface DynamicOptionsConfig {
  source: "api" | "function" | "store";
  url?: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  params?: Record<string, any>;
  transform?: (data: any) => SelectOption[];
  dependencies?: string[];
  cache?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
  icon?: string;
  description?: string;
}

// ============================================================================
// FORM SCHEMA TYPES
// ============================================================================

export interface FormSchema {
  id: string;
  title?: string;
  description?: string;
  fields: Field[];
  validation?: GlobalValidation;
  layout?: LayoutConfig;
  styling?: StylingConfig;
  behavior?: BehaviorConfig;
}

export interface LayoutConfig {
  type: "vertical" | "horizontal" | "grid" | "custom";
  spacing?: number;
  columns?: number;
  responsive?: ResponsiveConfig;
}

export interface ResponsiveConfig {
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface StylingConfig {
  theme?: "light" | "dark" | "auto";
  colorScheme?: string;
  customStyles?: Record<string, ViewStyle>;
}

export interface BehaviorConfig {
  autoSave?: boolean;
  autoSaveDelay?: number;
  resetOnSubmit?: boolean;
  focusFirstError?: boolean;
  scrollToError?: boolean;
}

// ============================================================================
// EVENT HANDLING TYPES
// ============================================================================

export interface FormEvents<T = Record<string, any>> {
  change?: (values: Partial<T>) => void;
  submit?: (values: T) => void | Promise<void>;
  reset?: () => void;
  validationChange?: (isValid: boolean, errors: ValidationErrors) => void;
  mount?: () => void;
  unmount?: () => void;
  fieldFocus?: (fieldId: string) => void;
  fieldBlur?: (fieldId: string) => void;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface StateManagerConfig {
  type: "zustand" | "mobx" | "internal";
  store?: any;
  selector?: (state: any) => any;
  updater?: (state: any, values: Record<string, any>) => void;
}

export interface StateManagerBridge {
  connect(config: StateManagerConfig): void;
  disconnect(): void;
  syncToExternal(values: Record<string, any>): void;
  syncFromExternal(): Record<string, any>;
  subscribe(callback: (values: Record<string, any>) => void): () => void;
}

// ============================================================================
// FORM COMPONENT PROPS
// ============================================================================

// Form component props
export interface FormProps<T = Record<string, any>> {
  schema: FormSchema; // Enhanced schema format
  initialValues?: Partial<T>;
  events?: FormEvents<T>; // Event handlers object
  stateManager?: StateManagerConfig;
  className?: string;
  disabled?: boolean;
  testID?: string;
}

// ============================================================================
// FORM REF TYPES
// ============================================================================

export interface FormRef<T = Record<string, any>> {
  submit: () => Promise<void>;
  reset: () => void;
  validate: () => Promise<ValidationResult>;
  setFieldValue: (fieldId: string, value: any) => void;
  getFieldValue: (fieldId: string) => any;
  getValues: () => T;
  setValues: (values: Partial<T>) => void;
  focus: (fieldId: string) => void;
  blur: (fieldId: string) => void;
  isValid: () => boolean;
  isDirty: () => boolean;
  isTouched: (fieldId?: string) => boolean;
}

// ============================================================================
// PARSING AND RENDERING TYPES
// ============================================================================

export interface ParsedSchema {
  fields: ParsedField[];
  validation: ValidationSchema;
  conditionalRules: ConditionalRule[];
  dependencies: DependencyGraph;
}

export interface ParsedField {
  field: Field;
  _parsed: {
    dependencies: string[];
    conditionalRules: ConditionalRule[];
    validationSchema?: z.ZodSchema;
  };
}

export interface ValidationSchema {
  global?: z.ZodSchema;
  fields: Record<string, z.ZodSchema>;
}

export interface RenderContext {
  values: Record<string, any>;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  disabled: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FieldComponent {
  (props: FieldComponentProps): React.ReactElement;
}

export interface FieldComponentProps {
  field: ParsedField;
  value: any;
  error?: string[];
  touched: boolean;
  disabled: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
  onFocus: () => void;
  context: RenderContext;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface FormError extends Error {
  type: "schema" | "validation" | "network" | "runtime";
  field?: string;
  code?: string;
  details?: any;
}

export interface ErrorBoundaryConfig {
  fallback?: React.ComponentType<{ error: FormError; retry: () => void }>;
  onError?: (error: FormError) => void;
  resetOnPropsChange?: boolean;
}

// ============================================================================
// SCHEMA PARSER TYPES
// ============================================================================

export interface SchemaParser {
  parse(schema: FormSchema): ParsedSchema;
  validate(schema: FormSchema): SchemaValidationResult;
  resolveFieldDependencies(schema: FormSchema): DependencyGraph;
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ============================================================================
// FIELD RENDERER TYPES
// ============================================================================

export interface FieldRenderer {
  render(field: ParsedField, context: RenderContext): React.ReactElement;
  registerFieldType(type: string, component: FieldComponent): void;
  getFieldComponent(type: string): FieldComponent | undefined;
}

// ============================================================================
// VALIDATION ENGINE TYPES
// ============================================================================

export interface ValidationEngine {
  validate(
    values: Record<string, any>,
    schema: ValidationSchema
  ): Promise<ValidationResult>;
  validateField(
    fieldId: string,
    value: any,
    schema: FieldValidationSchema
  ): Promise<FieldValidationResult>;
  addCustomValidator(name: string, validator: CustomValidator): void;
}

export interface FieldValidationSchema {
  required?: boolean;
  schema?: z.ZodSchema;
  custom?: CustomValidationRule[];
  async?: AsyncValidationRule[];
}

export interface CustomValidator {
  (value: any, allValues: Record<string, any>):
    | boolean
    | string
    | Promise<boolean | string>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type FormValues = Record<string, any>;

export type FieldPath = string;

export type FieldValue = any;
