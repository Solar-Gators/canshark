import logger from '@/logger';
import { connect, getDevices, requestDevice } from '@/usb/usb';
import { type SliceCreator } from '../store';

export enum DeviceState {
    disconnected = 'disconnected',
    connecting = 'connecting',
    connected = 'connected',
    errored = 'errored'
}

export interface Device {
    id: symbol;
    device: USBDevice;
    state: DeviceState;
}

export interface USBSlice {
    /** Device store */
    devices: Map<symbol, Device>;
    /** Active device, if there is one */
    activeDevice: Device | null;
    /** Connects to debugger */
    connectDevice: (id: symbol) => Promise<void>;
    /** Sets active device id */
    setActiveDevice: (device: Device | null) => void;
    /** Sets device state */
    setDeviceState: (id: symbol, state: DeviceState) => boolean;
    /** Gets device from UA, potentially prompting user */
    requestDevice: () => Promise<Device | null>;
    /** Gets paired devices from UA */
    loadDevices: () => Promise<void>;
    /** Adds device to store */
    addDevice: (device: USBDevice) => Device;
    /** Attempts to find a device by id or `USBDevice` instance */
    getDevice: (where: symbol | USBDevice) => Device | null;
    /** Removes device from store by symbol id or USB device object */
    removeDevice: (where: symbol | USBDevice) => boolean;
}

const deviceId = (usbDevice: USBDevice) => Symbol(`USB device ${String(usbDevice.vendorId)}/${String(usbDevice.productId)}`);

export const createUSBSlice: SliceCreator<USBSlice> = (set, get, store) => ({
    devices: new Map(),
    activeDevice: null,

    connectDevice: async (id) => {
        const device = get().getDevice(id);
        if (!device) return;

        get().setDeviceState(id, DeviceState.connecting);
        try {
            await connect(device.device);
            get().setDeviceState(id, DeviceState.connected);
        } catch (err: unknown) {
            get().setDeviceState(id, DeviceState.errored);
            logger.log('USB', 'Device failed to connect:', err);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        window.__device = device.device;
    },

    setActiveDevice: (device) => {
        set({ activeDevice: device });
    },

    setDeviceState: (id, newState) => {
        const devices = new Map(get().devices);
        let activeDevice = get().activeDevice;
        if (activeDevice) activeDevice = { ...activeDevice };

        const device = devices.get(id);
        if (device) {
            device.state = newState;
            devices.set(id, device);

            if (activeDevice && activeDevice.id === id) {
                activeDevice.state = newState;
                set({ devices, activeDevice });
            } else {
                set({ devices });
            }

            return true;
        }

        return false;
    },

    requestDevice: async () => {
        const usbDevice = await requestDevice();
        if (usbDevice) {
            return store.getState().addDevice(usbDevice);
        }

        return null;
    },

    loadDevices: async () => {
        const usbDevices = await getDevices();

        set(state => {
            const devices = new Map(state.devices);
            for (const usbDevice of usbDevices) {
                const device: Device = {
                    id: deviceId(usbDevice),
                    device: usbDevice,
                    state: DeviceState.disconnected
                };

                devices.set(device.id, device);
            }
            return { devices };
        });
    },

    addDevice: (device) => {
        const existing = get().getDevice(device);
        if (existing) {
            return existing;
        }

        const newDevice: Device = {
            id: deviceId(device),
            device,
            state: DeviceState.disconnected
        };

        set(state => {
            const devices = new Map(state.devices);
            devices.set(newDevice.id, newDevice);
            return { devices };
        });

        return newDevice;
    },

    getDevice: (where) => {
        const devices = get().devices;
        if (typeof where === 'symbol') {
            let device = devices.get(where) ?? null;
            if (device) device = { ...device };
            return device;
        } else {
            for (const device of devices.values()) {
                if (device.device === where) {
                    return { ...device };
                }
            }

            return null;
        }
    },

    removeDevice: (where) => {
        const device = get().getDevice(where);

        if (device) {
            const devices = new Map(get().devices);
            devices.delete(device.id);
            set({ devices });
            return true;
        }

        return false;
    }
});
