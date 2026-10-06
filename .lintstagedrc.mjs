/** Runs on staged files before every commit (husky pre-commit). */
const config = {
  '*.{ts,tsx,mts,cts,js,mjs,cjs}': [
    'eslint --fix --max-warnings=0 --no-warn-ignored',
    'prettier --write --ignore-unknown',
  ],
  '*.{json,md,mdx,css,yml,yaml}': ['prettier --write --ignore-unknown'],
}

export default config
