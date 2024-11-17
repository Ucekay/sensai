import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import {
	Pressable,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from 'react-native';

import * as Colors from '@bacons/apple-colors';
import { useActionSheet } from '@expo/react-native-action-sheet';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { type Observable, observe } from '@legendapp/state';
import { For, observer } from '@legendapp/state/react';
import { launchImagePlaygroundAsync } from 'react-native-apple-image-playground';
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import * as ContextMenu from 'zeego/context-menu';

import InfoTile from '@/components/InfoTile';
import {
	type Image as ImageType,
	imagesStore$,
	isFollowPromptEnabled$,
} from '@/observable';
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

const ImagesListItem = observer(
	({ item$ }: { item$: Observable<ImageType> }) => {
		const { showActionSheetWithOptions } = useActionSheet();
		const { width } = useWindowDimensions();
		const base64 = item$.base64.get();
		const createdAt = item$.createdAt.get();

		const handleEdit = async (base64: string) => {
			const result = await launchImagePlaygroundAsync({
				source: `data:image/jpg;base64,${base64}`,
			});
			if (result) {
				const manipulator =
					await ImageManipulator.ImageManipulator.manipulate(result);
				const manipResult = await (await manipulator.renderAsync()).saveAsync({
					base64: true,
				});
				if (manipResult.base64) {
					imagesStore$.images.push({
						createdAt: Date.now(),
						base64: manipResult.base64,
					});
				}
			}
		};
		const handleShare = (base64: string) => {
			Share.open({
				url: `data:image/jpg;base64,${base64}`,
				filename: `image-playground-${createdAt}.jpg`,
			});
		};

		const handleCopy = async (base64: string) => {
			await Clipboard.setImageAsync(base64);
		};

		const handleDelete = (item$: Observable<ImageType>) => {
			const title = 'Are you sure you want to delete this image?';
			const message =
				'This image will be deleted from this app but will remain in your Image Playground app.. ';
			const options = ['Delete', 'Cancel'];
			const destructiveButtonIndex = 0;
			const cancelButtonIndex = 1;
			showActionSheetWithOptions(
				{
					title,
					message,
					options,
					cancelButtonIndex,
					destructiveButtonIndex,
				},
				async (selectedIndex) => {
					switch (selectedIndex) {
						case 0:
							item$.delete();
							break;
						case 1:
							break;
					}
				},
			);
		};

		const imageWidth = width / 2 - 20;
		return (
			<Animated.View
				style={[styles.contextMenuRootContainer, { width: imageWidth }]}
				entering={FadeIn}
				exiting={FadeOut}
				layout={LinearTransition}
			>
				<ContextMenu.Root
					key={createdAt.toString()}
					style={[styles.contextMenuRoot, { width: imageWidth }]}
				>
					<ContextMenu.Trigger>
						<Animated.View
							style={[styles.contextMenuRootInner, { width: imageWidth }]}
							entering={FadeIn}
							exiting={FadeOut}
						>
							<Pressable style={{ width: imageWidth, aspectRatio: 1 }}>
								<Image
									source={{ uri: `data:image/jpg;base64,${base64}` }}
									style={StyleSheet.absoluteFillObject}
								/>
							</Pressable>
						</Animated.View>
					</ContextMenu.Trigger>

					<ContextMenu.Content>
						<ContextMenu.Group>
							<ContextMenu.Item
								key={`edit-${createdAt.toString()}`}
								onSelect={() => handleEdit(base64)}
							>
								<ContextMenu.ItemTitle>Edit</ContextMenu.ItemTitle>
								<ContextMenu.ItemIcon
									ios={{
										name: 'pencil',
									}}
								/>
							</ContextMenu.Item>
							<ContextMenu.Item
								key={`share-${createdAt.toString()}`}
								onSelect={() => handleShare(base64)}
							>
								<ContextMenu.ItemTitle>Share...</ContextMenu.ItemTitle>
								<ContextMenu.ItemIcon
									ios={{
										name: 'square.and.arrow.up',
									}}
								/>
							</ContextMenu.Item>
							<ContextMenu.Item
								key={`copy-${createdAt.toString()}`}
								onSelect={() => handleCopy(base64)}
							>
								<ContextMenu.ItemTitle>Copy</ContextMenu.ItemTitle>
								<ContextMenu.ItemIcon
									ios={{
										name: 'doc.on.doc',
									}}
								/>
							</ContextMenu.Item>
						</ContextMenu.Group>
						<ContextMenu.Item
							destructive
							key={`delete-${createdAt.toString()}`}
							onSelect={() => handleDelete(item$)}
						>
							<ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
							<ContextMenu.ItemIcon
								ios={{
									name: 'trash',
								}}
							/>
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			</Animated.View>
		);
	},
);

const index = observer(() => {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const insetsTop = insets.top;
	const insetsBottom = insets.bottom;
	const animatedIndex = useSharedValue(1);
	const infoTileStyle = [
		styles.infoTile,
		{ backgroundColor: Colors.systemFill },
	];

	const handleCreate = async () => {
		let result: string | undefined;
		if (animatedIndex.value > 0) {
			const status: DeviceStatus = {
				magneticField: magneticField$.z.peek(),
				batteryLevel: batteryLevel$.peek(),
				brightness: brightness$.peek(),
				hour: getHourFromTimeString(time$.peek() || '12:00'),
			};
			const promptWords = getPromptWords(status);
			result = await launchImagePlaygroundAsync({
				concepts: {
					text: promptWords,
				},
			});
		} else if (animatedIndex.value === 0) {
			result = await launchImagePlaygroundAsync();
		}
		if (result) {
			const manipulator =
				await ImageManipulator.ImageManipulator.manipulate(result);
			const manipResult = await (await manipulator.renderAsync()).saveAsync({
				base64: true,
			});
			if (manipResult.base64) {
				imagesStore$.images.push({
					createdAt: Date.now(),
					base64: manipResult.base64,
				});
			}
			const dispose = observe((e) => {
				if (
					imagesStore$.images.get().length % 3 === 0 &&
					isFollowPromptEnabled$.enabled.get()
				) {
					router.push('./follow-prompt-modal');
				}
			});
			dispose();
		}
	};

	const snapPoints = [64 + insetsBottom, 216 + insetsBottom];

	const animatedButtonContainerStyle = useAnimatedStyle(() => {
		if (animatedIndex.value > 1) {
			return {
				bottom: snapPoints[1],
			};
		}
		return {
			bottom:
				snapPoints[0] + (snapPoints[1] - snapPoints[0]) * animatedIndex.value,
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

	const listContainerStyle = useMemo(() => {
		return [
			styles.listContainer,
			{
				paddingTop: insetsTop,
				paddingBottom: insetsBottom,
			},
		];
	}, [insetsTop, insetsBottom]);

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
		<View style={styles.container}>
			<Animated.ScrollView
				showsVerticalScrollIndicator={false}
				style={{
					flex: 1,
				}}
				layout={LinearTransition}
			>
				<View style={listContainerStyle}>
					<For each={imagesStore$.images} item={ImagesListItem} />
				</View>
				<View style={{ height: snapPoints[1] }} />
			</Animated.ScrollView>
			<Animated.View
				style={[styles.buttonContainer, animatedButtonContainerStyle]}
			>
				<Pressable style={styles.createButton} onPress={handleCreate}>
					<SymbolView
						name="plus"
						tintColor={Colors.label as unknown as string}
						size={28}
					/>
				</Pressable>
			</Animated.View>
			<BottomSheet
				animatedIndex={animatedIndex}
				backgroundComponent={BottomSheetBackground}
				enableDynamicSizing
				index={1}
				handleIndicatorStyle={styles.bottomSheetHandleIndicator}
				snapPoints={snapPoints}
				containerStyle={styles.bottomSheetContainer}
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
						<View
							style={[
								StyleSheet.absoluteFill,
								{
									backgroundColor: Colors.systemFill,
									justifyContent: 'center',
								},
							]}
						>
							<Text style={styles.disabledText}>
								Device status prompts disabled
							</Text>
						</View>
					</Animated.View>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
});

export default index;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.systemBackground,
	},
	listContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',

		paddingHorizontal: 16,

		gap: 8,
	},
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
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
		height: 40,
		borderCurve: 'continuous',
		borderRadius: 20,
		backgroundColor: Colors.systemBackground,
	},
	disabledText: {
		fontSize: 20,
		textAlign: 'center',
		textAlignVertical: 'center',
		color: Colors.label,
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
	bottomSheetHandleIndicator: { backgroundColor: Colors.systemGray },
	bottomSheetContainer: { overflow: 'hidden' },
	buttonContainer: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		left: 0,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	contextMenuRoot: {
		overflow: 'hidden',
		borderCurve: 'continuous',
		borderRadius: 16,
		aspectRatio: 1,
	},
	contextMenuRootContainer: {
		borderCurve: 'continuous',
		borderRadius: 16,
		aspectRatio: 1,
	},
	contextMenuRootInner: {
		overflow: 'hidden',
		borderCurve: 'continuous',
		borderRadius: 16,
		aspectRatio: 1,
	},
});
