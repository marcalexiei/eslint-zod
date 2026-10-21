import type * as z from 'zod';
import type * as zm from 'zod/mini';
import type * as z3 from 'zod/v3';

type AnyFunction = (...args: never) => unknown;
type IsAny<T> = 0 extends 1 & T ? true : false;

/** The instance a schema constructor builds; `any` is dropped, since it would widen every union it joins. */
type InstanceOf<TValue> =
  IsAny<TValue> extends true
    ? never
    : TValue extends abstract new (...args: never) => infer TInstance
      ? IsAny<TInstance> extends true
        ? never
        : TInstance
      : never;

/** Every schema type a module exports a constructor for (`ZodString`, `ZodMiniString`, …). */
type SchemasOf<TModule, TSchema> = Extract<
  { [K in keyof TModule]: InstanceOf<TModule[K]> }[keyof TModule],
  TSchema
>;

/** The method names across a union of schema types. */
type MethodNamesOf<TSchemas> = TSchemas extends unknown
  ? { [K in keyof TSchemas]-?: TSchemas[K] extends AnyFunction ? K : never }[keyof TSchemas] &
      string
  : never;

/** A derived union, or one message every table fails on when the derivation stops matching zod's declarations. */
type Checked<TNames extends string, TLabel extends string> = [TNames] extends [never]
  ? `${TLabel} is empty: zod's declarations no longer match its derivation`
  : string extends TNames
    ? `${TLabel} widened to string: zod's declarations no longer match its derivation`
    : TNames;

/** A method on a `zod` schema — the v4 API, plus `zod/v3`, which the plugin's import scope also covers. */
export type ZodMethodName = Checked<
  | MethodNamesOf<SchemasOf<typeof z, { _zod: unknown }>>
  | MethodNamesOf<SchemasOf<typeof z3, { _def: unknown }>>,
  'ZodMethodName'
>;

/** A method on a `zod/mini` schema. */
export type ZodMiniMethodName = Checked<
  MethodNamesOf<SchemasOf<typeof zm, { _zod: unknown }>>,
  'ZodMiniMethodName'
>;

/** A top-level export of `zod`, `zod/v3` or `zod/mini`: factories, standalone checks and helpers. */
export type ZodExportName = Checked<
  Extract<keyof typeof z | keyof typeof z3 | keyof typeof zm, string>,
  'ZodExportName'
>;

/** A member of the `iso` namespace, dotted the way the check vocabulary spells it (`iso.date`). */
export type ZodIsoMemberName = Checked<
  `iso.${Extract<keyof typeof z.iso, string>}`,
  'ZodIsoMemberName'
>;
