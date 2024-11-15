import { Stack } from 'expo-router';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function RootLayout() {
	return (
		<GestureHandlerRootView>
			<ActionSheetProvider>
				<Stack
					screenOptions={{
						headerShown: false,
					}}
				>
					<Stack.Screen name="index" />
				</Stack>
			</ActionSheetProvider>
		</GestureHandlerRootView>
	);
}
