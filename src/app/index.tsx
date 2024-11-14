import * as ImageManipulator from 'expo-image-manipulator';
import { SymbolView } from 'expo-symbols';
import {
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from 'react-native';

import * as Colors from '@bacons/apple-colors';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { observe, when } from '@legendapp/state';
import { observer, useObservable } from '@legendapp/state/react';
import { launchImagePlaygroundAsync } from 'react-native-apple-image-playground';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InfoTile from '@/components/InfoTile';
import { imagesStore$ } from '@/observable';
import {
	batteryLevel$,
	brightness$,
	magneticField$,
	time$,
} from '@/observable';

// 磁力のマッピング (μT)
const magneticFieldMap = (value: number): string => {
	if (value >= 100) return 'intense presence';
	if (value >= 70) return 'powerful atmosphere';
	if (value >= 50) return 'dynamic space';
	if (value >= 30) return 'subtle harmony';
	return 'quiet essence';
};

// バッテリー残量のマッピング (%)
const batteryLevelMap = (value: number): string => {
	if (value >= 80) return 'vibrant presence';
	if (value >= 60) return 'strong essence';
	if (value >= 40) return 'stable form';
	if (value >= 20) return 'quiet atmosphere';
	return 'fading presence';
};

// 画面の明るさのマッピング (0-1)
const screenBrightnessMap = (value: number): string => {
	if (value >= 0.8) return 'intense atmosphere';
	if (value >= 0.6) return 'vivid presence';
	if (value >= 0.4) return 'balanced space';
	if (value >= 0.2) return 'gentle essence';
	return 'subtle form';
};

// 時間のマッピング (0-23時)
const timeOfDayMap = (hour: number): string => {
	if (hour >= 20 || hour < 4) return 'mysterious night';
	if (hour >= 16) return 'golden evening';
	if (hour >= 11) return 'vivid noon';
	if (hour >= 7) return 'bright morning';
	return 'misty dawn';
};

interface DeviceStatus {
	magneticField: number;
	batteryLevel: number;
	brightness: number;
	hour: number;
}

const getPromptWords = (status: DeviceStatus): string[] => {
	return [
		magneticFieldMap(status.magneticField),
		batteryLevelMap(status.batteryLevel),
		screenBrightnessMap(status.brightness),
		timeOfDayMap(status.hour),
	];
};

const getHourFromTimeString = (timeString: string): number => {
	return Number.parseInt(timeString.split(':')[0], 10);
};

const index = observer(() => {
	const insets = useSafeAreaInsets();
	const insetsTop = insets.top;
	const insetsBottom = insets.bottom;
	const { height } = useWindowDimensions();
	const animatedIndex = useSharedValue(1);
	const infoTileStyle = [
		styles.infoTile,
		{ backgroundColor: Colors.systemFill },
	];

	const image$ = useObservable('');

	const handleCreate = async () => {
		if (animatedIndex.value > 0) {
			const status: DeviceStatus = {
				magneticField: magneticField$.z.peek(),
				batteryLevel: batteryLevel$.peek(),
				brightness: brightness$.peek(),
				hour: getHourFromTimeString(time$.peek() || '12:00'),
			};
			const promptWords = getPromptWords(status);
			launchImagePlaygroundAsync({
				concepts: {
					text: promptWords,
				},
			}).then((result) => {
				if (result) {
					image$.set(result);
				}
			});
		} else if (animatedIndex.value === 0) {
			launchImagePlaygroundAsync().then((result) => {
				if (result) {
					image$.set(result);
				}
			});
		}

		await when(image$);

		const manipulator = await ImageManipulator.ImageManipulator.manipulate(
			image$.peek(),
		);
		const manipResult = (await manipulator.renderAsync()).saveAsync({
			base64: true,
		});
		console.log('manipRestlt', manipResult);
	};

	observe(imagesStore$.images, (e) => {
		console.log('imagesStore$.images', e);
	});

	const snapPoints = [64 + insetsBottom, 216 + insetsBottom];

	const animatedViewStyle = useAnimatedStyle(() => {
		if (animatedIndex.value > 1) {
			return {
				height: height - insetsTop - snapPoints[1],
			};
		}
		return {
			height:
				height -
				insetsTop -
				snapPoints[0] -
				(snapPoints[1] - snapPoints[0]) * animatedIndex.value,
		};
	});

	const animatedInfoContainerStyle = useAnimatedStyle(() => {
		return {
			opacity: animatedIndex.value,
		};
	});

	const animatedTextContainerStyle = useAnimatedStyle(() => {
		return {
			opacity: 1 - animatedIndex.value,
		};
	});

	const animatedBackgroundStyle = useAnimatedStyle(() => {
		return {
			marginTop: (1 - animatedIndex.value) * 24,
			marginHorizontal: (1 - animatedIndex.value) * 16,
			marginBottom: (1 - animatedIndex.value) * insetsBottom,
			opacity: animatedIndex.value,
		};
	});

	const BottomSheetBackground = () => {
		return (
			<View
				style={[
					StyleSheet.absoluteFillObject,
					styles.bottomSheetBackgroundContainer,
				]}
			>
				<Animated.View
					style={[
						animatedBackgroundStyle,
						StyleSheet.absoluteFillObject,
						styles.bottomSheetBackgroundInner,
					]}
				/>
			</View>
		);
	};

	return (
		<View
			style={{
				flex: 1,
				padding: 16,
				backgroundColor: Colors.systemBackground,
			}}
		>
			<SafeAreaView>
				<Animated.View style={animatedViewStyle}>
					<View style={{ flex: 1 }}></View>
					<Pressable style={styles.createButton} onPress={handleCreate}>
						<SymbolView name="plus" tintColor={Colors.label} size={28} />
					</Pressable>
				</Animated.View>
			</SafeAreaView>
			<BottomSheet
				animatedIndex={animatedIndex}
				backgroundComponent={BottomSheetBackground}
				enableDynamicSizing
				index={1}
				handleIndicatorStyle={{ backgroundColor: Colors.systemGray }}
				snapPoints={snapPoints}
				containerStyle={{ overflow: 'hidden' }}
			>
				<BottomSheetView
					style={{
						paddingBottom: insetsBottom,
					}}
				>
					<Animated.View
						style={[styles.infoTileContainer, animatedInfoContainerStyle]}
					>
						<InfoTile type="battery" style={infoTileStyle} />
						<InfoTile type="brightness" style={infoTileStyle} />
						<InfoTile type="time" style={infoTileStyle} />
						<InfoTile type="magnetic" style={infoTileStyle} />
					</Animated.View>
					<Animated.View
						style={[styles.disabledTextContainer, animatedTextContainerStyle]}
					>
						<Text style={[{ fontSize: 20 }, { color: Colors.label }]}>
							Device status prompts disabled
						</Text>
					</Animated.View>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
});

export default index;

const styles = StyleSheet.create({
	createButton: {
		alignItems: 'center',
		alignSelf: 'center',
		justifyContent: 'center',
		width: 60,
		height: 60,
		margin: 16,
		borderRadius: 30,
		backgroundColor: Colors.tertiarySystemGroupedBackground,
	},
	infoTile: {
		alignSelf: 'stretch',
		flex: 1,
		minWidth: '40%',
		padding: 16,
		borderCurve: 'continuous',
		borderRadius: 16,
		gap: 12,
	},
	infoTileContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingHorizontal: 16,
		columnGap: 12,
		rowGap: 12,
	},
	disabledTextContainer: {
		position: 'absolute',
		zIndex: 0,
		right: 16,
		left: 16,
		alignItems: 'center',
		justifyContent: 'center',
		height: 40,
		borderCurve: 'continuous',
		borderRadius: 20,
		backgroundColor: Colors.systemFill,
	},
	bottomSheetBackgroundContainer: {
		overflow: 'hidden',
		borderCurve: 'continuous',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	bottomSheetBackgroundInner: {
		borderCurve: 'continuous',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		backgroundColor: Colors.secondarySystemBackground,
	},
});
