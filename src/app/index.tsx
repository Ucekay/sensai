import { ThemedText as Text } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { imagesStore$ } from '@/observable';
import { observable } from '@legendapp/state';
import {
	Reactive,
	observer,
	useObservable,
	useObserve,
} from '@legendapp/state/react';
import { Magnetometer, type MagnetometerMeasurement } from 'expo-sensors';
import { Gyroscope } from 'expo-sensors';
import { DeviceMotion } from 'expo-sensors';
import { Barometer } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/src/DeviceSensor';
import { useEffect, useState } from 'react';

interface Subscriptions {
	mag: Subscription | null;
	gyro: Subscription | null;
	motion: Subscription | null;
	barometer: Subscription | null;
}

const index = observer(() => {
	const subscription$ = useObservable<Subscriptions>({
		mag: null,
		gyro: null,
		motion: null,
		barometer: null,
	});

	const magneticField$ = useObservable({
		x: 0,
		y: 0,
		z: 0,
	});

	const gyroscope$ = useObservable({
		x: 0,
		y: 0,
		z: 0,
	});

	const rotation$ = useObservable({
		alpha: 0,
		beta: 0,
		gamma: 0,
	});

	const barometer$ = useObservable({
		pressure: 0,
	});

	const normalMagneticField$ = useObservable(() => {
		const magData = magneticField$.get();
		const rotationData = rotation$.get();

		const alpha = rotationData.alpha;
		const beta = rotationData.beta;
		const gamma = rotationData.gamma;

		// 回転行列を構築
		const cosA = Math.cos(alpha);
		const sinA = Math.sin(alpha);
		const cosB = Math.cos(beta);
		const sinB = Math.sin(beta);
		const cosG = Math.cos(gamma);
		const sinG = Math.sin(gamma);

		// Z軸回転行列（alpha）
		const Rz = [
			[cosA, -sinA, 0],
			[sinA, cosA, 0],
			[0, 0, 1],
		];

		// X軸回転行列（beta）
		const Rx = [
			[1, 0, 0],
			[0, cosB, -sinB],
			[0, sinB, cosB],
		];

		// Y軸回転行列（gamma）
		const Ry = [
			[cosG, 0, sinG],
			[0, 1, 0],
			[-sinG, 0, cosG],
		];

		// 総合的な回転行列を計算（順序に注意）
		const R = multiplyMatrices(Rz, multiplyMatrices(Rx, Ry));

		// 磁場ベクトルを取得
		const magVector = [magData.x, magData.y, magData.z];

		// 磁場ベクトルに回転行列を適用
		const transformedMag = multiplyMatrixAndVector(R, magVector);

		// 画面法線方向（デバイスのZ軸）の磁場成分を取得
		const normalMagneticField = transformedMag[2];

		return normalMagneticField;
	});

	// 行列の積を計算する関数
	function multiplyMatrices(a: number[][], b: number[][]): number[][] {
		const result: number[][] = [];
		for (let i = 0; i < 3; i++) {
			result[i] = [];
			for (let j = 0; j < 3; j++) {
				result[i][j] =
					a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
			}
		}
		return result;
	}

	// 行列とベクトルの積を計算する関数
	function multiplyMatrixAndVector(matrix: number[][], vector: number[]) {
		const result = [];
		for (let i = 0; i < 3; i++) {
			result[i] =
				matrix[i][0] * vector[0] +
				matrix[i][1] * vector[1] +
				matrix[i][2] * vector[2];
		}
		return result;
	}

	const _subscribe = () => {
		subscription$.mag.set(
			Magnetometer.addListener((result) => {
				magneticField$.assign(result);
			}),
		);

		subscription$.gyro.set(
			Gyroscope.addListener((result) => {
				gyroscope$.assign(result);
			}),
		);

		subscription$.motion.set(
			DeviceMotion.addListener((result) => {
				rotation$.assign(result.rotation);
			}),
		);

		subscription$.barometer.set(
			Barometer.addListener((result) => {
				barometer$.assign(result);
			}),
		);
	};

	const _unsubscribe = () => {
		subscription$.delete();
		subscription$.assign({
			mag: null,
			gyro: null,
			motion: null,
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		_subscribe();
		Magnetometer.setUpdateInterval(500);
		Gyroscope.setUpdateInterval(500);
		DeviceMotion.setUpdateInterval(500);
		return () => _unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const magData = magneticField$.get();
	const gyroData = gyroscope$.get();
	const rotationData = rotation$.get();
	const barometerData = barometer$.get();

	const normalMag = normalMagneticField$.get();
	useEffect(() => {
		console.log('rendered');
	}, []);
	return (
		<ThemedView
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Text>Magnetic Field Normal to Screen:</Text>
			<Text>{normalMag.toFixed(2)} μT</Text>
			<Text>Barometer:</Text>
			<Text>Pressure: {barometerData.pressure.toFixed(0)} Pa</Text>
		</ThemedView>
	);
});

export default index;
