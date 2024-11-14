import { addBatteryLevelListener, getBatteryLevelAsync } from 'expo-battery';
import { useEffect } from 'react';

import { useObservable } from '@legendapp/state/react';

export const useBatteryLevel = () => {
	const batteryLevel$ = useObservable(0);

	useEffect(() => {
		getBatteryLevelAsync().then((level) => batteryLevel$.set(level));
		const subscription = addBatteryLevelListener(({ batteryLevel }) => {
			batteryLevel$.set(batteryLevel);
		});
		return () => subscription.remove();
	}, [batteryLevel$]);

	return batteryLevel$;
};
