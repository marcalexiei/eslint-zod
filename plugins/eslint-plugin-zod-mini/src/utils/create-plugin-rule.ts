import { createRuleCreator } from '@eslint-zod/utils';
import type { RuleCreator } from '@typescript-eslint/utils/eslint-utils';

import { getRuleURL } from '../meta.js';

// typed as typescript-eslint's creator: its `meta.schema` is checked, and RuleTester takes its modules
export const createZodMiniPluginRule = createRuleCreator(getRuleURL) as unknown as ReturnType<
  typeof RuleCreator
>;
