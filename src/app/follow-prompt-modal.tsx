import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Button,
	Linking,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';

import { Colors } from '@/constants/SystemColors';
import { isFollowPromptEnabled$ } from '@/observable';

export default function FollowPromptModal() {
	const router = useRouter();
	const [image, setImage] = useState<Asset | null>(null);
	const headerHeight = useHeaderHeight();

	useEffect(() => {
		const loadImage = async () => {
			const image = Asset.fromModule(require('@/assets/images/emix.jpg'));
			await image.downloadAsync();
			setImage(image);
		};
		loadImage();
	}, []);

	const handleDismiss = () => {
		isFollowPromptEnabled$.set({ enabled: false });
		router.back();
	};

	const handleBack = () => {
		router.back();
	};

	const handleOpenX = () => {
		Linking.openURL('https://x.com/endlessFrontend');
	};

	return (
		<View style={[styles.container, { paddingTop: headerHeight }]}>
			<View style={styles.imageContainer}>
				<Image source={image} style={{ width: '125%', aspectRatio: 1 }} />
			</View>
			<View style={styles.textContainer}>
				<Text style={{ fontSize: 24 }}>Hi! I'm DevLoop. 👋</Text>
				<Text style={styles.text}>
					{' '}
					If you enjoy this app or would like to support my journey, please
					follow me on X!
				</Text>
				<View style={styles.bodyContainer}>
					<Text style={styles.textBody}>
						{' '}
						I'm a Japanese university student developing React Native apps in my
						spare time. I aspire to become a developer who can make significant
						contributions to the open-source community from Japan.
					</Text>
					<View style={styles.followMe}>
						<Text style={styles.textBody}>Follow me </Text>
						<Pressable onPress={() => handleOpenX}>
							<Text style={styles.userName}>@endlessFrontend</Text>
						</Pressable>
						<Text style={styles.textBody}> ✨</Text>
					</View>
				</View>
			</View>
			<View style={styles.buttonContainer}>
				<View style={styles.buttonRow}>
					<Pressable onPress={handleDismiss} style={styles.dismissButton}>
						<Text style={styles.buttonText}>Never show this again</Text>
					</Pressable>
				</View>
				<View style={styles.buttonRow}>
					<Pressable style={styles.dismissButton} onPress={handleBack}>
						<Text style={styles.buttonText}>Return</Text>
					</Pressable>
					<Pressable style={styles.dismissButton} onPress={handleOpenX}>
						<Text style={styles.buttonText}>Open X</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: Colors.secondarySystemBackground,
		gap: 20,
	},
	imageContainer: {
		overflow: 'hidden',
		alignItems: 'center',
		alignSelf: 'center',
		width: '50%',
		borderColor: Colors.systemGray,
		borderRadius: 100,
		borderWidth: 1,
		aspectRatio: 1,
	},
	text: {
		fontSize: 20,
		color: Colors.label,
	},
	followMe: {
		flexDirection: 'row',
	},
	textBody: {
		fontSize: 17,
		color: Colors.label,
	},
	userName: {
		fontSize: 17,
		color: Colors.link,
	},
	textContainer: {
		padding: 8,
		gap: 16,
	},
	bodyContainer: {
		gap: 8,
	},
	dismissButton: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center',
		padding: 16,
		borderCurve: 'continuous',
		borderRadius: 16,
		backgroundColor: Colors.systemFill,
	},
	buttonText: {
		fontSize: 17,
		color: Colors.label,
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 12,
	},
	buttonContainer: {
		gap: 12,
	},
});
