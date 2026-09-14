import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'utils',
    // Specs touch no global state, so one worker can serve every file.
    isolate: false,
  },
});
