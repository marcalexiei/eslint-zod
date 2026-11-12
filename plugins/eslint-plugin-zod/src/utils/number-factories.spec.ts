import { getZodSchemaBaseType } from '@eslint-zod/utils';
import { describe, expect, it } from 'vitest';

import { NUMBER_FACTORIES } from './number-factories.js';

describe('NUMBER_FACTORIES', () => {
  it.each(NUMBER_FACTORIES)('`%s` builds a number schema', (name) => {
    expect(getZodSchemaBaseType(name)).toBe('number');
  });
});
