import { defineConfig } from 'lint-staged/config';

// Runs on staged files only. ESLint fixes first, then Prettier formats the result.
// `v10_config_lookup_from_file` makes ESLint use each file's nearest eslint.config.mjs
// (the per-project configs), matching what `nx lint` does.
const eslint =
  'eslint --fix --no-warn-ignored --max-warnings=0 --flag v10_config_lookup_from_file';

export default defineConfig({
  '*.{ts,mts,cts,js,mjs,cjs}': [eslint, 'prettier --write'],
  '*.{json,md,yml,yaml,css,scss,html}': 'prettier --write --ignore-unknown',
});
