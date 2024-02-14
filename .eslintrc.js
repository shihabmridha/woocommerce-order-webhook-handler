/* eslint-env node */
module.exports = {
	parser: '@typescript-eslint/parser',
	// parserOptions: {
	// 	ecmaVersion: 2020,
	// },
	plugins: [
		'@typescript-eslint'
	],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	rules: {
		'@typescript-eslint/semi': 'error',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
			},
		],
	},
	root: true,
};
