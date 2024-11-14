import * as Brightness from 'expo-brightness';
import { useEffect } from 'react';

import { useObservable } from '@legendapp/state/react';

export const useBrightness = () => {
	const brightness$ = useObservable(0);

	useEffect(() => {
		Brightness.getBrightnessAsync().then((level) => brightness$.set(level));
		const subscription = Brightness.addBrightnessListener(({ brightness }) => {
			brightness$.set(brightness);
		});
		return () => subscription.remove();
	}, [brightness$]);

	return brightness$;
};
