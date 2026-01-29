import { ControlParams, DeviceInfo, DeviceStatus, Op, Register, RegisterType, ReqType } from "./defs";

const fdcanReqBase: Omit<USBControlTransferParameters, 'request'> = {
    requestType: 'class',
    recipient: 'interface',
    index: 0,
    value: 0,
};

function control<O extends Op>(usbDevice: USBDevice, op: O, ...args: ControlParams[O]): Promise<ReqType[O]>;
function control(usbDevice: USBDevice, op: Op, register?: Register, value?: number): Promise<USBInTransferResult | USBOutTransferResult> {
    switch (op) {
        case Op.captureStart:
        case Op.captureStop:
        case Op.reset: {
            return usbDevice.controlTransferIn({
                ...fdcanReqBase,
                request: op,
            }, 0);
        }

        case Op.getDeviceInfo: {
            return usbDevice.controlTransferIn({
                ...fdcanReqBase,
                request: Op.getDeviceInfo,
            }, 32);
        }

        case Op.readRegister: {
            return usbDevice.controlTransferIn({
                ...fdcanReqBase,
                request: Op.readRegister,
                value: register ?? 0,
            }, 4);
        }

        case Op.writeRegister: {
            const buf = new ArrayBuffer(4);
            new DataView(buf).setUint32(0, value ?? 0, true);

            return usbDevice.controlTransferOut({
                ...fdcanReqBase,
                request: Op.writeRegister,
                value: register ?? 0,
            }, buf);
        }
    }
}

export async function startCapture(usbDevice: USBDevice) {
    const res = await control(usbDevice, Op.captureStart);

    if (res.status !== 'ok') {
        throw new Error('startCapture request failed');
    }

    return null;
}

export async function stopCapture(usbDevice: USBDevice) {
    const res = await control(usbDevice, Op.captureStart);

    if (res.status !== 'ok') {
        throw new Error('stopCapture request failed');
    }

    return null;
}

export async function getDeviceInfo(usbDevice: USBDevice): Promise<DeviceInfo> {
    const res = await control(usbDevice, Op.getDeviceInfo);

    if (res.status !== 'ok' || !res.data) {
        throw new Error('getDeviceInfo request failed');
    }

    if (res.data.byteLength < 32) {
        throw new Error('getDeviceInfo response not long enough');
    }

    const status = res.data.getUint8(0);
    const proto_version_maj = res.data.getUint8(1);
    const proto_version_min = res.data.getUint8(2);
    const hw_revision_maj = res.data.getUint8(3);
    const hw_revision_min = res.data.getUint8(4);
    const fw_version_maj = res.data.getUint8(5);
    const fw_version_min = res.data.getUint8(6);
    const fw_version_pat = res.data.getUint8(7);
    const fw_build_id = res.data.getUint32(8, true);

    return {
        status: status in DeviceStatus ? status : DeviceStatus.unknown,
        protocolVersion: [proto_version_maj, proto_version_min],
        hardwareRevision: [hw_revision_maj, hw_revision_min],
        firmwareVersion: [fw_version_maj, fw_version_min, fw_version_pat],
        firmwareBuildId: fw_build_id
    };
}

/**
 * Reads a gadget FDCAN register
 * @param usbDevice USB device instance
 * @param register register to read
 * @returns numeric register value
 */
export async function readRegister(usbDevice: USBDevice, register: Register): Promise<number> {
    const res = await control(usbDevice, Op.readRegister, register);

    if (res.status !== 'ok' || !res.data) {
        throw new Error('readRegister request failed');
    }

    if (res.data.byteLength !== 4) {
        throw new Error(`readRegister response incorrect length; got ${String(res.data.byteLength)} expected 4`);
    }

    return res.data.getUint32(0, true);
}

/**
 * Writes a gadget FDCAN register
 * @param usbDevice USB device instance
 * @param register register to write
 * @param value value to write
 * @returns {void}
 */
export async function writeRegister<Reg extends Register>(usbDevice: USBDevice, register: Reg, value: RegisterType[Reg]): Promise<void> {
    const res = await control(usbDevice, Op.writeRegister, register, value);

    if (res.status !== 'ok') {
        throw new Error('writeRegister request failed');
    }

    return;
}

export async function reset(usbDevice: USBDevice): Promise<void> {
    const res = await control(usbDevice, Op.reset);

    if (res.status !== 'ok') {
        throw new Error('reset request failed');
    }

    return;
}