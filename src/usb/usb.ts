export const VENDOR_ID = 0x0483;
export const PRODUCT_ID = 0x5740;

/** Filters USB device by vendor and product IDs */
export const debuggerFilterFn = (device: USBDevice) => device.vendorId === VENDOR_ID && device.productId == PRODUCT_ID;

export async function getDevices(): Promise<USBDevice[]> {
    if (!supportsWebUSB()) return [];

    return await navigator.usb.getDevices()
        .then(devices => devices.filter(debuggerFilterFn));
}

export async function requestDevice(): Promise<USBDevice | null> {
    if (!supportsWebUSB()) return null;

    try {
        return await navigator.usb.requestDevice({
            filters: [{
                vendorId: VENDOR_ID,
                productId: PRODUCT_ID,
            }]
        });
    } catch (err: unknown) {
        if (err instanceof DOMException) {
            console.warn(err.name);
            return null;
        } else {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            return Promise.reject(err);
        }
    }
}

/** Determines WebUSB support */
export function supportsWebUSB(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return 'usb' in window.navigator;
}

/** Connect to the debugger and prepare for use */
export async function connect(usbDevice: USBDevice) {
    await usbDevice.open();
    await usbDevice.selectConfiguration(1);
    await usbDevice.claimInterface(0);
}