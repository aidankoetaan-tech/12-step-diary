const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'android/*', 'ios/*']),
  expoConfig,
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
