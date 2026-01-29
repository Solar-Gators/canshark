import { create, StateCreator } from 'zustand';

import { createUSBSlice, USBSlice } from './usb/slice';

export interface SharedSlice {
    __dummy: [];
}

export type RootStore = SharedSlice & USBSlice;

export type SliceCreator<T> = StateCreator<RootStore, [], [], T>;

export const useStore = create<RootStore>((...args) => ({
    __dummy: [],
    ...createUSBSlice(...args)
}));