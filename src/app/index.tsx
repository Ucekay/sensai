import { SFSymbol, SymbolView, SymbolViewProps } from 'expo-symbols';
import { useEffect } from 'react';
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
import { observer } from '@legendapp/state/react';
import { launchImagePlaygroundAsync } from 'react-native-apple-image-playground';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withClamp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InfoTile from '@/components/InfoTile';
import { imagesStore$ } from '@/observable';
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

	const handleCreate = () => {
		launchImagePlaygroundAsync();
	};

	const snapPoints = [108 + insetsBottom, 204 + insetsBottom];

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
		height: 84,
		borderCurve: 'continuous',
		borderRadius: 16,
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
