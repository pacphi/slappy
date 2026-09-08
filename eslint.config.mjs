import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.agentic-qe/**', '.claude-flow/**', '.swarm/**', '.codex/**'],
  },
  {
    rules: { 'vue/html-self-closing': 'off' },
  },
  {
    files: ['app/**/*.{ts,vue}', 'lib/**/*.ts', 'server/**/*.ts', 'shared/**/*.ts', 'cli/**/*.ts'],
    rules: { complexity: ['error', 10] },
  }
)
