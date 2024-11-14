import { Magnetometer } from 'expo-sensors';
import { useEffect } from 'react';

import { magneticField$ } from '@/observable';

export const useMagneticField = () => {
	useEffect(() => {
		const magSubscription = Magnetometer.addListener((result) => {
			magneticField$.assign({
				x: Math.abs(result.x),
				y: Math.abs(result.y),
				z: Math.abs(result.z),
			});
		});

		Magnetometer.setUpdateInterval(500);

		return () => {
			magSubscription.remove();
		};
	}, []);

	return magneticField$;
};
