declare global {
type USBDirection = "in" | "out";
type USBEndpointType = "bulk" | "interrupt" | "isochronous";

type USBTransferStatus = "ok" | "stall" | "babble";

interface USBConnectionEventInit extends EventInit {
    device: USBDevice;
}

interface USBConnectionEvent extends Event {
    readonly device: USBDevice;
}

var USBConnectionEvent: {
    prototype: USBConnectionEvent;
    new(type: string, eventInitDict: USBConnectionEventInit): USBConnectionEvent;
};

/**
 * The **`USBInTransferResult`** interface represents the result from requesting a transfer of data from the USB device to the USB host.
 * 
 * [MDN Reference](https://developer.mozilla.org/Web/API/USBInTransferResult)
 */
interface USBInTransferResult {
    /**
     * The read-only **`data`** property contains the data received from the USB device, if any.
     * 
     * [MDN Reference](https://developer.mozilla.org/Web/API/USBInTransferResult/data)
     */
    readonly data: DataView | null;

    /**
     * The read-only **`status`** property indicates the status of the transfer request.
     * 
     * [MDN Reference](https://developer.mozilla.org/Web/API/USBInTransferResult/status)
     */
    readonly status: USBTransferStatus;
}

var USBInTransferResult: {
    prototype: USBInTransferResult;
    new (status: USBTransferStatus, data?: DataView | null): USBInTransferResult;
};

interface USBOutTransferResult {
    readonly bytesWritten: number;
    readonly status: USBTransferStatus;
}

var USBOutTransferResult: {
    prototype: USBOutTransferResult;
    new (status: USBTransferStatus, bytesWritten?: number): USBOutTransferResult;
};

interface USBIsochronousInTransferPacket {
    readonly data: DataView | null;
    readonly status: USBTransferStatus;
}

var USBIsochronousInTransferPacket: {
    prototype: USBIsochronousInTransferPacket;
    new (status: USBTransferStatus, data?: DataView | null): USBIsochronousInTransferPacket;
};

interface USBIsochronousInTransferResult {
    readonly data: DataView | null;
    readonly packets: USBIsochronousInTransferPacket[];
}

var USBIsochronousInTransferResult: {
    prototype: USBIsochronousInTransferResult;
    new (packets: USBIsochronousInTransferPacket[], data?: DataView | null): USBIsochronousInTransferResult;
};

interface USBIsochronousOutTransferPacket {
    readonly bytesWritten: number;
    readonly status: USBTransferStatus;
}

var USBIsochronousOutTransferPacket: {
    prototype: USBIsochronousOutTransferPacket;
    new (status: USBTransferStatus, bytesWritten?: number): USBIsochronousOutTransferPacket;
};

interface USBIsochronousOutTransferResult {
    readonly packets: USBIsochronousOutTransferPacket[];
}

var USBIsochronousOutTransferResult: {
    prototype: USBIsochronousOutTransferResult;
    new (packets: USBIsochronousOutTransferPacket[]): USBIsochronousOutTransferResult;
};

type USBRequestType = "standard" | "class" | "vendor";
type USBRecipient = "device" | "interface" | "endpoint" | "other";

interface USBControlTransferParameters {
    requestType: USBRequestType;
    recipient: USBRecipient;
    request: number;
    value: number;
    index: number;
}

interface USBEndpoint {
    readonly endpointNumber: number;
    readonly direction: USBDirection;
    readonly type: USBEndpointType;
    readonly packetSize: number;
}

var USBEndpoint: {
    prototype: USBEndpoint;
    new (alternate: USBAlternateInterface, endpointNumber: number, direction: USBDirection): USBEndpoint;
};

interface USBAlternateInterface {
    readonly alternateSetting: number;
    readonly interfaceClass: number;
    readonly interfaceSubclass: number;
    readonly interfaceProtocol: number;
    readonly endpoints: USBEndpoint[];
}

var USBAlternateInterface: {
    prototype: USBAlternateInterface;
    new (deviceInterface: USBInterface, alternateSetting: number): USBAlternateInterface;
};

interface USBInterface {
    readonly interfaceNumber: number;
    readonly alternate: USBAlternateInterface;
    readonly alternates: USBAlternateInterface[];
    readonly claimed: boolean;
}

var USBInterface: {
    prototype: USBInterface;
    new(configuration: USBConfiguration, interfaceNumber: number): USBInterface;
};

interface USBConfiguration {
    readonly configurationValue: number;
    readonly configurationName: string;
    readonly interfaces: USBInterface[];
}

var USBConfiguration: {
    prototype: USBConfiguration;
    new(device: USBDevice, configurationValue: number): USBConfiguration;
};

interface USBDevice {
    readonly usbVersionMajor: number;
    readonly usbVersionMinor: number;
    readonly usbVersionSubminor: number;
    readonly deviceClass: number;
    readonly deviceSubclass: number;
    readonly deviceProtocol: number;
    readonly vendorId: number;
    readonly productId: number;
    readonly deviceVersionMajor: number;
    readonly deviceVersionMinor: number;
    readonly deviceVersionSubminor: number;
    readonly manufacturerName: string | null;
    readonly productName: string | null;
    readonly serialNumber: string | null;
    readonly configuration: USBConfiguration | null;
    readonly configurations: USBConfiguration[];
    readonly opened: boolean;

    open(): Promise<undefined>;
    close(): Promise<undefined>;
    forget(): Promise<undefined>;
    selectConfiguration(configurationValue: number): Promise<undefined>;
    claimInterface(interfaceNumber: number): Promise<undefined>;
    releaseInterface(interfaceNumber: number): Promise<undefined>;
    selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<undefined>;
    controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
    controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>;
    clearHalt(direction: USBDirection, endpointNumber: number): Promise<void>;
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    isochronousTransferIn(endpointNumber: number, packetLengths: number[]): Promise<USBIsochronousInTransferResult>
    isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: number[]): Promise<USBIsochronousOutTransferResult>;
    reset(): Promise<undefined>;
}

interface USBEventHandlers {
    onconnect: ((this: USBEventHandlers, ev: USBConnectionEvent) => any) | null;
    ondisconnect: ((this: USBEventHandlers, ev: USBConnectionEvent) => any) | null;
}

interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
    serialNumber?: string;
}

interface USBEventMap {
    "connect": USBConnectionEvent;
    "disconnect": USBConnectionEvent;
}

interface USBDeviceRequestOptions {
    filters: USBDeviceFilter[];
    exclusionFilters?: USBDeviceFilter[];
}

interface USB extends EventTarget, USBEventHandlers {
    addEventListener<K extends keyof USBEventMap>(type: K, listener: (this: USB, ev: USBEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof USBEventMap>(type: K, listener: (this: USB, ev: USBEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

    getDevices(): Promise<USBDevice[]>;
    requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
}

/** Available only in secure contexts. */
interface NavigatorUSB {
    /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/USB) */
    readonly usb: USB;
}

interface Navigator extends NavigatorUSB {}

interface WorkerNavigator extends NavigatorUSB {}
}

export {};