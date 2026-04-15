import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    target: 'es2023',
  },
  test: {
    globals: true,
    maxWorkers: 1,
    testTimeout: 10 * 60_000,
  },
});
