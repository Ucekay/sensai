import { Magnetometer } from 'expo-sensors';
import { useEffect } from 'react';

import { useObservable } from '@legendapp/state/react';

export const useMagneticField = () => {
	const magneticField$ = useObservable({
		x: 0,
		y: 0,
		z: 0,
	});

	useEffect(() => {
		const magSubscription = Magnetometer.addListener((result) => {
			magneticField$.assign(result);
		});

		Magnetometer.setUpdateInterval(500);

		return () => {
			magSubscription.remove();
		};
	}, [magneticField$]);

	return magneticField$;
};
