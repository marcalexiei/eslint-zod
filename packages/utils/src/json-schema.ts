/**
 * JSON Schema draft 4, as a rule's `meta.schema` is written.
 * Vendored from `@typescript-eslint/utils` (MIT, © typescript-eslint and other contributors),
 * so that a schema typed here is one its `RuleTester` accepts.
 * @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/utils/src/json-schema.ts
 */

type JSONSchema4TypeName =
  'any' | 'array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string';

type JSONSchema4Type = boolean | number | string | null;

type JSONSchema4TypeExtended = JSONSchema4Array | JSONSchema4Object | JSONSchema4Type;

interface JSONSchema4Object {
  [key: string]: JSONSchema4TypeExtended;
}

type JSONSchema4Array = Array<JSONSchema4TypeExtended>;

export type JSONSchema4 =
  | JSONSchema4AllOfSchema
  | JSONSchema4AnyOfSchema
  | JSONSchema4AnySchema
  | JSONSchema4ArraySchema
  | JSONSchema4BooleanSchema
  | JSONSchema4MultiSchema
  | JSONSchema4NullSchema
  | JSONSchema4NumberSchema
  | JSONSchema4ObjectSchema
  | JSONSchema4OneOfSchema
  | JSONSchema4RefSchema
  | JSONSchema4StringSchema;

interface JSONSchema4Base {
  $defs?: Record<string, JSONSchema4> | undefined;
  $ref?: string | undefined;
  $schema?: string | undefined;
  allOf?: Array<JSONSchema4> | undefined;
  anyOf?: Array<JSONSchema4> | undefined;
  default?: JSONSchema4TypeExtended | undefined;
  definitions?: Record<string, JSONSchema4> | undefined;
  description?: string | undefined;
  extends?: string | Array<string> | undefined;
  id?: string | undefined;
  not?: JSONSchema4 | undefined;
  oneOf?: Array<JSONSchema4> | undefined;
  required?: boolean | Array<string> | undefined;
  title?: string | undefined;
  type?: JSONSchema4TypeName | Array<JSONSchema4TypeName> | undefined;
}

interface JSONSchema4RefSchema extends JSONSchema4Base {
  $ref: string;
  type?: undefined;
}

interface JSONSchema4AllOfSchema extends JSONSchema4Base {
  allOf: Array<JSONSchema4>;
  type?: undefined;
}

interface JSONSchema4AnyOfSchema extends JSONSchema4Base {
  anyOf: Array<JSONSchema4>;
  type?: undefined;
}

interface JSONSchema4OneOfSchema extends JSONSchema4Base {
  oneOf: Array<JSONSchema4>;
  type?: undefined;
}

interface JSONSchema4MultiSchema
  extends
    Omit<JSONSchema4ObjectSchema, 'enum' | 'type'>,
    Omit<JSONSchema4ArraySchema, 'enum' | 'type'>,
    Omit<JSONSchema4StringSchema, 'enum' | 'type'>,
    Omit<JSONSchema4NumberSchema, 'enum' | 'type'>,
    Omit<JSONSchema4BooleanSchema, 'enum' | 'type'>,
    Omit<JSONSchema4NullSchema, 'enum' | 'type'>,
    Omit<JSONSchema4AnySchema, 'enum' | 'type'> {
  enum?: Array<JSONSchema4Type>;
  type: Array<JSONSchema4TypeName>;
}

interface JSONSchema4ObjectSchema extends JSONSchema4Base {
  additionalProperties?: boolean | JSONSchema4 | undefined;
  dependencies?: Record<string, JSONSchema4 | Array<string>> | undefined;
  maxProperties?: number | undefined;
  minProperties?: number | undefined;
  patternProperties?: Record<string, JSONSchema4> | undefined;
  properties?: Record<string, JSONSchema4> | undefined;
  type: 'object';
}

interface JSONSchema4ArraySchema extends JSONSchema4Base {
  additionalItems?: boolean | JSONSchema4 | undefined;
  items?: JSONSchema4 | Array<JSONSchema4> | undefined;
  maxItems?: number | undefined;
  minItems?: number | undefined;
  type: 'array';
  uniqueItems?: boolean | undefined;
}

interface JSONSchema4StringSchema extends JSONSchema4Base {
  enum?: Array<string> | undefined;
  format?:
    | 'date'
    | 'date-time'
    | 'email'
    | 'hostname'
    | 'ipv4'
    | 'ipv6'
    | 'json-pointer'
    | 'json-pointer-uri-fragment'
    | 'regex'
    | 'relative-json-pointer'
    | 'time'
    | 'uri'
    | 'uri-reference'
    | 'uri-template'
    | 'url'
    | 'uuid'
    | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  pattern?: string | undefined;
  type: 'string';
}

interface JSONSchema4NumberSchema extends JSONSchema4Base {
  enum?: Array<number> | undefined;
  exclusiveMaximum?: boolean | undefined;
  exclusiveMinimum?: boolean | undefined;
  maximum?: number | undefined;
  minimum?: number | undefined;
  multipleOf?: number | undefined;
  type: 'integer' | 'number';
}

interface JSONSchema4BooleanSchema extends JSONSchema4Base {
  enum?: Array<boolean> | undefined;
  type: 'boolean';
}

interface JSONSchema4NullSchema extends JSONSchema4Base {
  enum?: Array<null> | undefined;
  type: 'null';
}

interface JSONSchema4AnySchema extends JSONSchema4Base {
  type: 'any';
}
