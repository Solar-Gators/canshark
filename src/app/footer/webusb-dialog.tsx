'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import * as R from '@radix-ui/themes';
import React from 'react';
import { supportsWebUSB } from '@/usb/usb';

export function WebUSBDialog() {
    const [supportsUSB, setSupportsWebUSB] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        setSupportsWebUSB(supportsWebUSB());
    }, []);

    if (supportsUSB === null) return <></>;

    return (
        <R.Dialog.Root defaultOpen={!supportsUSB}>
            {!supportsUSB && (
                <R.Dialog.Trigger>
                    <R.Flex align="center" asChild>
                        <R.Button size="1" variant="surface" color="red">
                            <ExclamationTriangleIcon width="10" height="10" />
                            Unsupported Browser
                        </R.Button>
                    </R.Flex>
                </R.Dialog.Trigger>
            )}

            <R.Dialog.Content>
                <R.Dialog.Title>Unsupported Browser</R.Dialog.Title>
                <R.Dialog.Description>
                    Your browser doesn't support Web USB, which CANshark uses to connect to the CAN debugger. Use Google
                    Chrome or Microsoft Edge. You can still view and edit DBCs.
                </R.Dialog.Description>
            </R.Dialog.Content>
        </R.Dialog.Root>
    );
}
