import { defineConfig } from 'vite-plus';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve paths relative to this config file (ESM has no __dirname).
const here = dirname(fileURLToPath(import.meta.url));

// The shared utils lib is resolved from source and bundled into main.mjs.
// Don't list @nestjs-template/utils in apps/api/package.json: the bundler
// would externalize it and main.mjs would fail with ERR_MODULE_NOT_FOUND.
const utilsAlias = {
  '@nestjs-template/utils': join(here, '../../packages/utils/src/index.ts'),
};

export default defineConfig({
  root: here,
  cacheDir: '../../node_modules/.vite/apps/api',
  // Nest DI and route reflection need legacy decorators + emitted metadata.
  // Tests are transformed by Vite's oxc transform, so set them here too.
  oxc: {
    decorator: {
      legacy: true,
      emitDecoratorMetadata: true,
    },
  },
  resolve: {
    alias: utilsAlias,
  },

  // `vp pack` (tsdown: rolldown + the oxc transformer) builds the API.
  // tsdown reads tsconfig.app.json, so experimentalDecorators +
  // emitDecoratorMetadata are honored by the build as well.
  pack: {
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
    },
    entry: [join(here, 'src/main.ts')],
    // ESM output; Nest's CommonJS packages are loaded through Node's CJS interop.
    format: ['esm'],
    platform: 'node',
    target: 'node22',
    outDir: join(here, '../../dist/apps/api'),
    tsconfig: join(here, 'tsconfig.app.json'),
    sourcemap: true,
    clean: true,
    // node_modules deps are externalized by default; nothing to inline for a Nest server.
    dts: false,
    alias: utilsAlias,
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
