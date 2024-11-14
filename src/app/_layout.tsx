import { Stack } from 'expo-router';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function RootLayout() {
	return (
		<GestureHandlerRootView>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name="index" />
			</Stack>
		</GestureHandlerRootView>
	);
}
