import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve paths relative to this config file (ESM has no __dirname).
const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: '../../node_modules/.vite/apps/api',
  // Nest DI and route reflection need legacy decorators + emitted metadata,
  // the same settings tsdown applies to the build.
  oxc: {
    decorator: {
      legacy: true,
      emitDecoratorMetadata: true,
    },
  },
  resolve: {
    alias: {
      '@nestjs-template/types': join(here, '../../packages/types/src/index.ts'),
    },
  },
  test: {
    name: 'api',
    environment: 'node',
    include: ['src/**/__tests__/**/*.{spec,test}.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/apps/api',
    },
  },
});
