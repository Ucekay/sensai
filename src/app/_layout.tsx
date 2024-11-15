import { Stack } from 'expo-router';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/SystemColors';
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
					<Stack.Screen
						name="follow-prompt-modal"
						options={{
							headerShown: true,
							headerTransparent: true,
							headerTintColor: Colors.label as unknown as string,
							title: 'Thank you for enjoying my app!',

							presentation: 'modal',
						}}
					/>
				</Stack>
			</ActionSheetProvider>
		</GestureHandlerRootView>
	);
}
