import { SchemaParser, schemaParser } from "../SchemaParser";
import type { FormSchema, NumberField, SelectField, TextField } from "../types";

describe("SchemaParser", () => {
  let parser: SchemaParser;

  beforeEach(() => {
    parser = SchemaParser.getInstance();
  });

  describe("validate", () => {
    describe("schema validation", () => {
      it("should validate correct schema", () => {
        const validSchema: FormSchema = {
          id: "test-form",
          fields: [
            { id: "field1", label: "Field 1", type: "text" } as TextField,
          ],
        };

        const result = parser.validate(validSchema);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should detect missing schema id", () => {
        const invalidSchema = {
          fields: [{ id: "field1", label: "Field 1", type: "text" }],
        } as any;

        const result = parser.validate(invalidSchema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Schema id is required");
      });

      it("should detect invalid fields array", () => {
        const invalidSchema = {
          id: "test-form",
          fields: "not-an-array",
        } as any;

        const result = parser.validate(invalidSchema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Schema fields must be an array");
      });

      it("should validate field-specific requirements", () => {
        const invalidSchema: FormSchema = {
          id: "test-form",
          fields: [
            { id: "select1", label: "Select", type: "select" } as SelectField, // Missing options
            { id: "slider1", label: "Slider", type: "slider" } as any, // Missing min/max
            { id: "rating1", label: "Rating", type: "rating", max: 0 } as any, // Invalid max
          ],
        };

        const result = parser.validate(invalidSchema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "fields[0] of type select requires options"
        );
        expect(result.errors).toContain(
          "fields[1] of type slider requires min and max numbers"
        );
        expect(result.errors).toContain(
          "fields[2] of type rating requires max number > 0"
        );
      });

      it("should validate conditional rule references", () => {
        const invalidSchema: FormSchema = {
          id: "test-form",
          fields: [
            {
              id: "field1",
              label: "Field 1",
              type: "text",
              conditional: {
                show: [
                  { field: "nonexistent", operator: "equals", value: "test" },
                ],
              },
            } as TextField,
          ],
        };

        const result = parser.validate(invalidSchema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "conditional.show[0].field references unknown field: nonexistent"
        );
      });
    });

    it("should handle null/undefined schemas", () => {
      expect(parser.validate(null as any).isValid).toBe(false);
      expect(parser.validate(undefined as any).isValid).toBe(false);
    });
  });

  describe("resolveFieldDependencies", () => {
    it("should resolve dependencies from conditional rules", () => {
      const schema: FormSchema = {
        id: "test-form",
        fields: [
          { id: "field1", label: "Field 1", type: "text" } as TextField,
          {
            id: "field2",
            label: "Field 2",
            type: "text",
            conditional: {
              show: [{ field: "field1", operator: "equals", value: "show" }],
              hide: [{ field: "field1", operator: "equals", value: "hide" }],
            },
          } as TextField,
          {
            id: "field3",
            label: "Field 3",
            type: "text",
            conditional: {
              enable: [
                { field: "field1", operator: "not_equals", value: "" },
                { field: "field2", operator: "contains", value: "test" },
              ],
            },
          } as TextField,
        ],
      };

      const dependencies = parser.resolveFieldDependencies(schema);

      expect(dependencies).toEqual({
        field2: ["field1"],
        field3: ["field1", "field2"],
      });
    });

    it("should resolve dependencies from dynamic options", () => {
      const schema: FormSchema = {
        id: "test-form",
        fields: [
          {
            id: "country",
            label: "Country",
            type: "select",
            options: [],
          } as SelectField,
          {
            id: "state",
            label: "State",
            type: "select",
            options: {
              source: "api",
              url: "/api/states",
              dependencies: ["country"],
            },
          } as SelectField,
        ],
      };

      const dependencies = parser.resolveFieldDependencies(schema);

      expect(dependencies).toEqual({
        state: ["country"],
      });
    });

    it("should detect circular dependencies", () => {
      const schema: FormSchema = {
        id: "test-form",
        fields: [
          {
            id: "field1",
            label: "Field 1",
            type: "text",
            conditional: {
              show: [{ field: "field2", operator: "equals", value: "test" }],
            },
          } as TextField,
          {
            id: "field2",
            label: "Field 2",
            type: "text",
            conditional: {
              show: [{ field: "field1", operator: "equals", value: "test" }],
            },
          } as TextField,
        ],
      };

      expect(() => parser.resolveFieldDependencies(schema)).toThrow(
        "Circular dependency detected"
      );
    });
  });

  describe("parse", () => {
    it("should parse valid schema", () => {
      const schema: FormSchema = {
        id: "test-form",
        fields: [
          {
            id: "field1",
            label: "Field 1",
            type: "text",
            required: true,
          } as TextField,
          {
            id: "field2",
            label: "Field 2",
            type: "number",
            conditional: {
              show: [{ field: "field1", operator: "not_equals", value: "" }],
            },
          } as NumberField,
        ],
      };

      const result = parser.parse(schema);

      expect(result.fields).toHaveLength(2);
      expect(result.fields[0]._parsed.dependencies).toEqual([]);
      expect(result.fields[1]._parsed.dependencies).toEqual(["field1"]);

      expect(result.dependencies).toEqual({
        field2: ["field1"],
      });

      expect(result.conditionalRules).toHaveLength(1);
      expect(result.conditionalRules[0]).toMatchObject({
        field: "field1",
        operator: "not_equals",
        value: "",
      });
    });

    it("should throw error for invalid schema", () => {
      const invalidSchema = {
        formConfig: {},
        formElements: [],
      } as any;

      expect(() => parser.parse(invalidSchema)).toThrow(
        "Schema validation failed"
      );
    });

    it("should handle parsing errors gracefully", () => {
      const malformedSchema = {
        id: "test",
        fields: [
          {
            id: "field1",
            label: "Field 1", // Add required label
            type: "text",
            conditional: {
              show: [{ field: "field1", operator: "equals", value: "test" }], // Self-reference
            },
          },
        ],
      } as any;

      expect(() => parser.parse(malformedSchema)).toThrow(
        "Circular dependency detected"
      );
    });
  });

  describe("singleton behavior", () => {
    it("should return the same instance", () => {
      const instance1 = SchemaParser.getInstance();
      const instance2 = SchemaParser.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should use the exported singleton", () => {
      const instance = SchemaParser.getInstance();
      expect(schemaParser).toBe(instance);
    });
  });

  describe("error handling", () => {
    it("should create FormError with proper structure", () => {
      const invalidSchema = null as any;

      try {
        parser.parse(invalidSchema);
      } catch (error: any) {
        expect(error.name).toBe("FormError");
        expect(error.type).toBe("schema");
        expect(error.code).toBe("SCHEMA_VALIDATION_ERROR");
        expect(error.message).toContain("Schema validation failed");
      }
    });
  });
});
