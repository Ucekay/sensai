import { useCalendars, useLocales } from 'expo-localization';
import React from 'react';
import { StyleSheet, View,Text } from 'react-native';
import type { ViewProps } from 'react-native';

import { currentTime } from '@legendapp/state/helpers/time';
import { observer, useObservable } from '@legendapp/state/react';

import { Colors } from '@/constants/SystemColors';
import { useBatteryLevel } from '@/hooks/useBatteryLevel';
import { useBrightness } from '@/hooks/useBrightness';
import { useMagneticField } from '@/hooks/useMagneticField';

import { ThemedText } from './ThemedText';

type InfoTileType = 'magnetic' | 'battery' | 'brightness' | 'time';

interface InfoTileProps extends ViewProps {
	type: InfoTileType;
}

const InfoTile = observer((props: InfoTileProps) => {
	const { type, style, ...rest } = props;
	const magneticField = useMagneticField();
	const brightness = useBrightness();
	const batteryLevel = useBatteryLevel();

	const locales = useLocales();
	const calendars = useCalendars();
	const languageTag = locales[0]?.languageTag;
	const timeZone = calendars[0]?.timeZone;

	const time$ = useObservable(() => {
		if (languageTag && timeZone) {
			return new Date(currentTime.get()).toLocaleTimeString(languageTag, {
				timeZone,
				hour: 'numeric',
				minute: 'numeric',
				hour12: false,
			});
		}
		return '';
	});

	const getValue = () => {
		switch (type) {
			case 'magnetic':
				return {
					value: magneticField.z.get().toFixed(2),
					unit: 'μT',
				};
			case 'battery':
				return { value: (batteryLevel.get() * 100).toFixed(0), unit: '%' };
			case 'brightness':
				return { value: (brightness.get() * 100).toFixed(0), unit: '%' };
			case 'time':
				return { value: time$.get(), unit: '' };
			default:
				return { value: 0, unit: '' };
		}
	};

	const { value, unit } = getValue();

	const getTitle = () => {
		switch (type) {
			case 'magnetic':
				return 'Magnetic Field';
			case 'battery':
				return 'Battery Level';
			case 'brightness':
				return 'Brightness';
			case 'time':
				return 'Current Time';
			default:
				return '';
		}
	};

	return (
		<View style={style} {...rest}>
			<Text style={[styles.title, {color: Colors.secondaryLabel}]}>{getTitle()}</Text>
			<Text style={[styles.value, {color: Colors.label}]}>
				{typeof value === 'number' ? value : value}
			</Text>
		</View>
	);
});

const styles = StyleSheet.create({
	title: {
		fontSize: 14,
		marginBottom: 4,
	},
	value: {
		fontSize: 24,
		fontWeight: 'bold',
	},
});

export default InfoTile;
