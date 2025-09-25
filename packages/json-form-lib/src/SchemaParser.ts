import { z } from "zod";
import type {
    ConditionalRule,
    DependencyGraph,
    Field,
    FormSchema,
    SchemaParser as ISchemaParser,
    ParsedField,
    ParsedSchema,
    SchemaValidationResult,
    ValidationSchema,
} from "./types";

export class SchemaParser implements ISchemaParser {
  private static instance: SchemaParser;

  public static getInstance(): SchemaParser {
    if (!SchemaParser.instance) {
      SchemaParser.instance = new SchemaParser();
    }
    return SchemaParser.instance;
  }

  public parse(schema: FormSchema): ParsedSchema {
    const validationResult = this.validate(schema);
    if (!validationResult.isValid) {
      throw new FormError(
        `Schema validation failed: ${validationResult.errors.join(", ")}`,
        "schema",
        "SCHEMA_VALIDATION_ERROR",
        { errors: validationResult.errors }
      );
    }

    const parsedFields = this.parseFields(schema.fields);
    const dependencies = this.resolveFieldDependencies(schema);
    const conditionalRules = this.extractConditionalRules(schema.fields);
    const validationSchema = this.buildValidationSchema(schema);

    return {
      fields: parsedFields,
      validation: validationSchema,
      conditionalRules,
      dependencies,
    };
  }

  public validate(schema: FormSchema): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!schema) {
      errors.push("Schema is required");
      return { isValid: false, errors, warnings };
    }

    if (!schema.id) {
      errors.push("Schema id is required");
    }

    if (!Array.isArray(schema.fields)) {
      errors.push("Schema fields must be an array");
    } else {
      schema.fields.forEach((field, index) => {
        if (!field.id) {
          errors.push(`fields[${index}].id is required`);
        }
        if (!field.label) {
          errors.push(`fields[${index}].label is required`);
        }
        if (!field.type) {
          errors.push(`fields[${index}].type is required`);
        }

        // Field-specific validation
        switch (field.type) {
          case "select":
          case "multiselect":
            if (!field.options) {
              errors.push(`fields[${index}] of type ${field.type} requires options`);
            }
            break;
          case "radio":
            if (!field.options || !Array.isArray(field.options)) {
              errors.push(`fields[${index}] of type radio requires options array`);
            }
            break;
          case "slider":
            if (typeof field.min !== "number" || typeof field.max !== "number") {
              errors.push(`fields[${index}] of type slider requires min and max numbers`);
            }
            break;
          case "rating":
            if (typeof field.max !== "number" || field.max <= 0) {
              errors.push(`fields[${index}] of type rating requires max number > 0`);
            }
            break;
          case "array":
            if (!field.itemSchema) {
              errors.push(`fields[${index}] of type array requires itemSchema`);
            }
            break;
          case "object":
            if (!field.fields || !Array.isArray(field.fields)) {
              errors.push(`fields[${index}] of type object requires fields array`);
            }
            break;
        }
      });

      // Check for duplicate field IDs
      const ids = schema.fields.map((field) => field.id).filter(Boolean);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate field IDs found: ${duplicateIds.join(", ")}`);
      }

      // Validate conditional rule references
      schema.fields.forEach((field) => {
        if (field.conditional) {
          this.validateConditionalRules(field.conditional, ids).forEach(error => errors.push(error));
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public resolveFieldDependencies(schema: FormSchema): DependencyGraph {
    const dependencies: DependencyGraph = {};

    schema.fields.forEach((field) => {
      const fieldDeps = this.extractFieldDependencies(field);
      if (fieldDeps.length > 0) {
        dependencies[field.id] = fieldDeps;
      }
    });

    this.validateDependencyGraph(dependencies);
    return dependencies;
  }

  private parseFields(fields: Field[]): ParsedField[] {
    return fields.map((field) => ({
      field,
      _parsed: {
        dependencies: this.extractFieldDependencies(field),
        conditionalRules: this.extractFieldConditionalRules(field),
        validationSchema: this.buildFieldValidationSchema(field),
      },
    }));
  }

  private extractFieldDependencies(field: Field): string[] {
    const dependencies: string[] = [];

    if (field.conditional) {
      const addRuleDependencies = (rules: ConditionalRule[] | undefined) => {
        if (rules) {
          rules.forEach((rule) => {
            if (rule.field && !dependencies.includes(rule.field)) {
              dependencies.push(rule.field);
            }
          });
        }
      };

      addRuleDependencies(field.conditional.show);
      addRuleDependencies(field.conditional.hide);
      addRuleDependencies(field.conditional.enable);
      addRuleDependencies(field.conditional.disable);
      addRuleDependencies(field.conditional.require);
    }

    // Add dependencies from dynamic options
    if (field.type === "select" || field.type === "multiselect") {
      const selectField = field as any;
      if (selectField.options && typeof selectField.options === "object" && selectField.options.dependencies) {
        selectField.options.dependencies.forEach((dep: string) => {
          if (!dependencies.includes(dep)) {
            dependencies.push(dep);
          }
        });
      }
    }

    return dependencies;
  }

  private extractFieldConditionalRules(field: Field): ConditionalRule[] {
    const rules: ConditionalRule[] = [];

    if (field.conditional) {
      if (field.conditional.show) rules.push(...field.conditional.show);
      if (field.conditional.hide) rules.push(...field.conditional.hide);
      if (field.conditional.enable) rules.push(...field.conditional.enable);
      if (field.conditional.disable) rules.push(...field.conditional.disable);
      if (field.conditional.require) rules.push(...field.conditional.require);
    }

    return rules;
  }

  private extractConditionalRules(fields: Field[]): ConditionalRule[] {
    const allRules: ConditionalRule[] = [];
    fields.forEach((field) => {
      const fieldRules = this.extractFieldConditionalRules(field);
      allRules.push(...fieldRules);
    });
    return allRules;
  }

  private buildValidationSchema(schema: FormSchema): ValidationSchema {
    const fieldSchemas: Record<string, z.ZodSchema> = {};

    schema.fields.forEach((field) => {
      const fieldSchema = this.buildFieldValidationSchema(field);
      if (fieldSchema) {
        fieldSchemas[field.id] = fieldSchema;
      }
    });

    return {
      global: schema.validation?.schema,
      fields: fieldSchemas,
    };
  }

  private buildFieldValidationSchema(field: Field): z.ZodSchema | undefined {
    let schema: z.ZodSchema | undefined;

    if (field.validation?.schema) {
      schema = field.validation.schema;
    } else {
      schema = this.getBaseSchemaForFieldType(field);
    }

    if (field.required && schema) {
      if (schema instanceof z.ZodString) {
        schema = schema.min(1, "This field is required");
      }
    } else if (schema) {
      schema = schema.optional();
    }

    return schema;
  }

  private getBaseSchemaForFieldType(field: Field): z.ZodSchema | undefined {
    switch (field.type) {
      case "text":
      case "password":
      case "email":
      case "textarea":
        return z.string();
      case "number":
        return z.number();
      case "checkbox":
      case "switch":
        return z.boolean();
      case "date":
      case "time":
      case "datetime":
        return z.date();
      case "select":
        return z.string();
      case "multiselect":
        return z.array(z.string());
      case "array":
        return z.array(z.any());
      case "object":
        return z.record(z.any());
      case "file":
        return z.any();
      case "slider":
      case "rating":
        return z.number();
      default:
        return z.any();
    }
  }

  private validateConditionalRules(conditional: any, availableFieldIds: string[]): string[] {
    const errors: string[] = [];

    const validateRuleArray = (rules: ConditionalRule[] | undefined, ruleName: string) => {
      if (rules) {
        rules.forEach((rule, index) => {
          if (!rule.field) {
            errors.push(`${ruleName}[${index}].field is required`);
          } else if (!availableFieldIds.includes(rule.field)) {
            errors.push(`${ruleName}[${index}].field references unknown field: ${rule.field}`);
          }
          if (!rule.operator) {
            errors.push(`${ruleName}[${index}].operator is required`);
          }
          if (rule.operator === "custom" && !rule.customRule) {
            errors.push(`${ruleName}[${index}] with custom operator requires customRule function`);
          }
        });
      }
    };

    validateRuleArray(conditional.show, "conditional.show");
    validateRuleArray(conditional.hide, "conditional.hide");
    validateRuleArray(conditional.enable, "conditional.enable");
    validateRuleArray(conditional.disable, "conditional.disable");
    validateRuleArray(conditional.require, "conditional.require");

    return errors;
  }

  private validateDependencyGraph(dependencies: DependencyGraph): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (fieldId: string): boolean => {
      if (recursionStack.has(fieldId)) {
        return true;
      }
      if (visited.has(fieldId)) {
        return false;
      }

      visited.add(fieldId);
      recursionStack.add(fieldId);

      const deps = dependencies[fieldId] || [];
      for (const dep of deps) {
        if (hasCycle(dep)) {
          return true;
        }
      }

      recursionStack.delete(fieldId);
      return false;
    };

    for (const fieldId of Object.keys(dependencies)) {
      if (hasCycle(fieldId)) {
        throw new FormError(
          `Circular dependency detected involving field: ${fieldId}`,
          "schema",
          "CIRCULAR_DEPENDENCY_ERROR",
          { fieldId, dependencies }
        );
      }
    }
  }
}

export const schemaParser = SchemaParser.getInstance();
/**
 *
 Custom FormError class for schema-related errors
 */
class FormError extends Error {
  public readonly type: "schema" | "validation" | "network" | "runtime";
  public readonly field?: string;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    type: "schema" | "validation" | "network" | "runtime",
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = "FormError";
    this.type = type;
    this.code = code;
    this.details = details;
  }
}