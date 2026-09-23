import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/build/**/*.test.ts'],
    testTimeout: 120_000,
  },
});
