import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['server/**/*.test.js', 'src/**/*.test.ts'],
    globals: false,
  },
});
