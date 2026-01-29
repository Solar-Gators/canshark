export const CTL_EP = 0x00;
export const OUT_EP = 0x01;
export const IN_EP = 0x01;
export const INT_EP = 0x02;

export const enum Op {
    getDeviceInfo = 0,
    captureStart = 1,
    captureStop = 2,
    readRegister = 3,
    writeRegister = 4,
    reset = 5
}

/** Gadget register address */
export const enum Register {
    frameFormat = 0,
    mode = 1,
    autoRetransmission = 2
}

export interface RegisterType {
    [Register.frameFormat]: FrameFormat;
    [Register.mode]: Mode;
    [Register.autoRetransmission]: AutoRetransmission;
}

/** FDCAN frame format */
export enum FrameFormat {
    classic = 0,
    fdNoBRS = 1,
    fdBRS = 2
}

/** FDCAN mode */
export enum Mode {
    normal = 0,
    restrictedOperation = 1,
    busMonitoring = 2,
    internalLoopback = 3,
    externalLoopback = 4
}

/** FDCAN auto retransmission */
export enum AutoRetransmission {
    enable = 1,
    disable = 0
}

export enum DeviceStatus {
    ok = 0x00,
    genericError = 0x01,

    unknown = 0xFF,
}

/*************************** Type maps ***************************/

/** Return type of control request for each opcode */
export interface ReqType {
    [Op.captureStart]: USBInTransferResult;
    [Op.captureStop]: USBInTransferResult;
    [Op.getDeviceInfo]: USBInTransferResult;
    [Op.readRegister]: USBInTransferResult;
    [Op.writeRegister]: USBOutTransferResult;
    [Op.reset]: USBInTransferResult;
}

/** Control request params for each opcode */
export interface ControlParams {
    [Op.captureStart]: [];
    [Op.captureStop]: [];
    [Op.getDeviceInfo]: [];
    [Op.readRegister]: [register: Register];
    [Op.writeRegister]: [register: Register, value: number];
    [Op.reset]: [];
}

/*************************** Return types ***************************/

/** Device info struct */
export interface DeviceInfo {
    status: DeviceStatus;
    protocolVersion: [number, number];
    hardwareRevision: [number, number];
    firmwareVersion: [number, number, number];
    firmwareBuildId: number;
}