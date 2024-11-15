import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { syncObservable } from '@legendapp/state/sync';

const isFollowPromptEnabled$ = observable({ enabled: true });

syncObservable(isFollowPromptEnabled$, {
	persist: {
		name: 'isFollowPromptEnabled',
		plugin: ObservablePersistMMKV,
	},
});

export { isFollowPromptEnabled$ };
