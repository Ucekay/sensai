import { useCalendars, useLocales } from 'expo-localization';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewProps } from 'react-native';

import { currentTime } from '@legendapp/state/helpers/time';
import { observer, useObservable } from '@legendapp/state/react';

import { Colors } from '@/constants/SystemColors';
import { useBatteryLevel } from '@/hooks/useBatteryLevel';
import { useBrightness } from '@/hooks/useBrightness';
import { useMagneticField } from '@/hooks/useMagneticField';
import { time$ } from '@/observable';

import { ThemedText } from './ThemedText';

type InfoTileType = 'magnetic' | 'battery' | 'brightness' | 'time';

interface InfoTileProps extends ViewProps {
	type: InfoTileType;
}

const InfoTile = observer((props: InfoTileProps) => {
	const { type, style, ...rest } = props;
	const magneticField$ = useMagneticField();
	const brightness$ = useBrightness();
	const batteryLevel$ = useBatteryLevel();

	const locales = useLocales();
	const calendars = useCalendars();
	const languageTag = locales[0]?.languageTag;
	const timeZone = calendars[0]?.timeZone;

	useEffect(() => {
		if (languageTag && timeZone) {
			time$.set(() =>
				new Date(currentTime.get()).toLocaleTimeString(languageTag, {
					timeZone,
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				}),
			);
		} else {
			time$.set(() => '');
		}
	}, [languageTag, timeZone]); // 依存配列に必要な値を指定
	const getValue = () => {
		switch (type) {
			case 'magnetic':
				return {
					value: magneticField$.z.get().toFixed(2),
					unit: 'μT',
				};
			case 'battery':
				return {
					value: (batteryLevel$.get() * 100).toFixed(0),
					unit: '%',
				};
			case 'brightness':
				return { value: (brightness$.get() * 100).toFixed(0), unit: '%' };
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
				return 'brightness';
			case 'time':
				return 'Current Time';
			default:
				return '';
		}
	};

	return (
		<View style={style} {...rest}>
			<Text style={[styles.title, { color: Colors.secondaryLabel }]}>
				{getTitle()}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-around',
					alignItems: 'baseline',
				}}
			>
				<Text style={[styles.value, { color: Colors.label }]}>
					{typeof value === 'number' ? value : value}
				</Text>
				<Text style={[styles.unit, { color: Colors.label }]}>{unit}</Text>
			</View>
		</View>
	);
});

const styles = StyleSheet.create({
	title: {
		fontSize: 14,
	},
	value: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		flex: 1,
	},
	unit: {
		fontSize: 20,
		fontWeight: 'bold',
		textAlignVertical: 'bottom',
	},
});

export default InfoTile;
