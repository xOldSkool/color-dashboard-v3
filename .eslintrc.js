module.exports = {
    root: true,
    extends: [
      'next/core-web-vitals',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    plugins: ['react-refresh'],
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  };
  