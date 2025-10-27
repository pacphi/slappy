import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Disable self-closing rule for void elements to match Prettier's behavior
    'vue/html-self-closing': 'off',
  },
})
