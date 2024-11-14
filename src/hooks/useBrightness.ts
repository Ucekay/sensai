import * as Brightness from 'expo-brightness';
import { useEffect } from 'react';

import { brightness$ } from '@/observable';

export const useBrightness = () => {
	useEffect(() => {
		Brightness.getBrightnessAsync().then((level) => brightness$.set(level));
		const subscription = Brightness.addBrightnessListener(({ brightness }) => {
			brightness$.set(brightness);
		});
		return () => subscription.remove();
	}, []);

	return brightness$;
};
