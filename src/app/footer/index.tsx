'use client';

import * as R from '@radix-ui/themes';

import { DBCDialog } from './dbc';
import { Menu } from './menu';
import { DeviceMenu } from './usb';
import { WebUSBDialog } from './webusb-dialog';

export function Footer() {
    return (
        <div className="sticky bottom-0 left-0 border-t border-(--gray-a4) bg-(--gray-a1) backdrop-blur-sm">
            <R.Flex className="mx-auto max-w-6xl" align="center" justify="between" px="3" py="2" asChild>
                <footer>
                    <R.Flex align="center" gapX="5">
                        <WebUSBDialog />
                        <DeviceMenu />
                    </R.Flex>

                    <R.Flex align="center" gapX="5">
                        <DBCDialog />
                        <Menu />
                    </R.Flex>
                </footer>
            </R.Flex>
        </div>
    );
}
