'use client';

import { Button, ButtonProps, DataList, HoverCard, Inset } from '@radix-ui/themes';
import { DeviceState } from '@/lib/store/usb/slice';
import { useDeviceManager } from '@/usb/hooks';

function deviceStateLabel(device: { state: DeviceState } | null) {
    switch (device?.state) {
        case DeviceState.connected:
            return 'Connected';
        case DeviceState.disconnected:
            return 'Disconnected';
        case DeviceState.connecting:
            return 'Connecting';
        case DeviceState.errored:
            return 'Errored';
        case undefined:
            return 'Connect a debugger';
    }
}

function deviceStateLabelColor(device: { state: DeviceState } | null): ButtonProps['color'] {
    switch (device?.state) {
        case DeviceState.connected:
            return 'green';
        case DeviceState.disconnected:
            return 'red';
        case DeviceState.connecting:
            return 'orange';
        case DeviceState.errored:
            return 'red';
        case undefined:
            return undefined;
    }
}

export function DeviceMenu() {
    const { activeDevice } = useDeviceManager();

    const deviceVersion = (() => {
        if (!activeDevice) return '';

        const {
            deviceVersionMajor: major,
            deviceVersionMinor: minor,
            deviceVersionSubminor: subminor,
        } = activeDevice.device;
        if ([major, minor, subminor].some((v) => typeof v !== 'number')) {
            return 'Unavailable';
        }

        // const hex = (n: number, len = 2) => n.toString(16).padStart(len, '0');

        return `${String(major)}.${String(minor)}.${String(subminor)}`;
    })();

    return (
        <HoverCard.Root>
            <HoverCard.Trigger>
                <Inset clip="padding-box">
                    <Button size="1" variant="soft" color={deviceStateLabelColor(activeDevice)}>
                        {deviceStateLabel(activeDevice)}
                    </Button>
                </Inset>
            </HoverCard.Trigger>

            <HoverCard.Content>
                <DataList.Root>
                    <DataList.Item>
                        <DataList.Label>Name</DataList.Label>
                        <DataList.Value>{activeDevice?.device.productName ?? ''}</DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.Label>Version</DataList.Label>
                        <DataList.Value className="font-mono">{deviceVersion}</DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.Label>Serial #</DataList.Label>
                        <DataList.Value className="font-mono">
                            {activeDevice?.device.serialNumber ?? 'Unavailable'}
                        </DataList.Value>
                    </DataList.Item>
                </DataList.Root>
            </HoverCard.Content>
        </HoverCard.Root>
    );
}
