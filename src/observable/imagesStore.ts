import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { syncObservable } from '@legendapp/state/sync';

interface Image {
	createdAt: number;
	base64: string;
}

interface ImagesStore {
	images: Image[];
}

const imagesStore$ = observable<ImagesStore>({
	images: Array<Image>,
});

syncObservable(imagesStore$, {
	persist: {
		name: 'generatedImageStore',
		plugin: ObservablePersistMMKV,
	},
});

export { imagesStore$ };
