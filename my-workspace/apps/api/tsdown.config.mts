import { defineConfig } from 'tsdown';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve paths relative to this config file (it is loaded as an ES module,
// so __dirname is unavailable).
const here = dirname(fileURLToPath(import.meta.url));

// Builds the NestJS API with the oxc toolchain (rolldown + the oxc transformer).
// tsdown reads tsconfig.app.json, so experimentalDecorators + emitDecoratorMetadata
// (required for Nest DI and route reflection) are honored by the oxc transform.
export default defineConfig({
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
  // Resolve the workspace alias so the shared utils lib is bundled into main.mjs.
  // Don't list @nestjs-template/utils in apps/api/package.json: tsdown would
  // externalize it and main.mjs would fail with ERR_MODULE_NOT_FOUND.
  alias: {
    '@nestjs-template/utils': join(here, '../../packages/utils/src/index.ts'),
  },
});
