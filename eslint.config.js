import js        from '@eslint/js'
import pluginVue  from 'eslint-plugin-vue'
import globals    from 'globals'

export default [
  { ignores: ['dist/**'] },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // Errores que bloquean — los más importantes
      'no-redeclare':  'error',   // ← habría atrapado showCobrarModal duplicado
      'no-undef':      'error',

      // Advertencias — ayudan pero no bloquean
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Vue — relajamos reglas cosméticas para no saturar de warnings
      'vue/multi-word-component-names':               'off',
      'vue/html-self-closing':                        'off',
      'vue/max-attributes-per-line':                  'off',
      'vue/singleline-html-element-content-newline':  'off',
      'vue/multiline-html-element-content-newline':   'off',
      'vue/attributes-order':                         'off',
    },
  },
]
