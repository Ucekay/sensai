import { addBatteryLevelListener, getBatteryLevelAsync } from 'expo-battery';
import { useEffect } from 'react';

import { batteryLevel$ } from '@/observable';

export const useBatteryLevel = () => {
	useEffect(() => {
		getBatteryLevelAsync().then((level) => batteryLevel$.set(level));
		const subscription = addBatteryLevelListener(({ batteryLevel }) => {
			batteryLevel$.set(batteryLevel);
		});
		return () => subscription.remove();
	}, []);

	return batteryLevel$;
};
