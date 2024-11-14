// https://docs.expo.dev/guides/using-eslint/
module.exports = {
	extends: 'expo',
	plugins: ['eslint-plugin-react-compiler', 'react-native-style-order'],
	rules: {
		'import/order': [
			'warn',
			{
				alphabetize: {
					order: 'asc',
				},
				groups: [
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
					'object',
					'type',
				],
				'newlines-between': 'always',
				pathGroups: [
					{
						pattern: 'expo-*',
						group: 'builtin',
						position: 'before',
					},
					{
						pattern: 'react',
						group: 'builtin',
						position: 'before',
					},
					{
						pattern: 'react-native',
						group: 'builtin',
						position: 'before',
					},
				],
				distinctGroup: false,
				pathGroupsExcludedImportTypes: ['builtin'],
			},
		],
		'react-native-style-order/sort-style-props': [
			'warn',
			{
				order: 'predefined',
			},
		],
	},
};
