import React from "react";
import { useStore } from "@/lib/store/store";
import logger from "@/logger";
import { supportsWebUSB } from "./usb";
import { DeviceState } from "@/lib/store/usb/slice";

export function useDeviceManager() {
    const activeDevice = useStore(state => state.activeDevice);
    const devices = useStore(state => state.devices);

    const connectDevice = useStore(state => state.connectDevice);
    const setDeviceState = useStore(state => state.setDeviceState);
    const loadDevices = useStore(state => state.loadDevices);
    const addDevice = useStore(state => state.addDevice);
    const getDevice = useStore(state => state.getDevice);
    const setActiveDevice = useStore(state => state.setActiveDevice);

    React.useEffect(() => {
        if (!supportsWebUSB()) return;

        void loadDevices();

        const onConnect = (ev: USBConnectionEvent) => {
            const device = addDevice(ev.device);
            void connectDevice(device.id)
                .then(() => {
                    setActiveDevice(device);
                });

            logger.log('USB', 'Device manager: Device connected', ev.device);
        };

        const onDisconnect = (ev: USBConnectionEvent) => {
            logger.log('USB', 'Device manager: Device disconnected', ev.device);

            const device = getDevice(ev.device);
            if (device) {
                setDeviceState(device.id, DeviceState.disconnected);
            }
        };

        navigator.usb.addEventListener('connect', onConnect);
        navigator.usb.addEventListener('disconnect', onDisconnect);

        return () => {
            navigator.usb.removeEventListener('connect', onConnect);
            navigator.usb.removeEventListener('disconnect', onDisconnect);
        };
    }, []);

    React.useEffect(() => {
        const firstDevice = devices.values().next().value;
        if (!activeDevice && firstDevice) {
            setActiveDevice(firstDevice);
            void connectDevice(firstDevice.id);
        }

        console.log('Devices hook');
    }, [devices]);

    return {
        activeDevice,
        loadDevices,
    };
}