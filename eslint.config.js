const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'android/*', 'ios/*']),
  expoConfig,
  {
    rules: {
      // `useRef(new Animated.Value(0)).current` is the documented React
      // Native pattern for animated values; the react-hooks refs rule
      // reports it as a false positive ("cannot access refs during render").
      'react-hooks/refs': 'off',
      // Apostrophes and quotes in user-facing copy are intentional; HTML-
      // escaping them in JSX text hurts readability for no runtime benefit.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    // Plain Node.js scripts (run with `node scripts/...`)
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'writable',
      },
    },
  },
]);
