// https://docs.expo.dev/guides/using-eslint/
module.exports = {
	extends: 'expo',
	plugins: ['eslint-plugin-react-compiler', 'react-native-style-order'],
	rules: {
		'react-compiler/react-compiler': 'error',
	},
};
