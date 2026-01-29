/** FDCAN ID type */
export enum IdType {
    /** Standard ID */
    standard,
    /** Extended ID */
    extended,
}

/** FDCAN frame type */
export enum FrameType {
    /** Data frame */
    data,
    /** Remote frame */
    remote,
}

/** FDCAN Data Length Code */
export enum DLC {
    bytes0 = 0x0,
    bytes1 = 0x1,
    bytes2 = 0x2,
    bytes3 = 0x3,
    bytes4 = 0x4,
    bytes5 = 0x5,
    bytes6 = 0x6,
    bytes7 = 0x7,
    bytes8 = 0x8,
    bytes12 = 0x9,
    bytes16 = 0xA,
    bytes20 = 0xB,
    bytes24 = 0xC,
    bytes32 = 0xD,
    bytes48 = 0xE,
    bytes64 = 0xF
}

const dlcMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 20, 24, 32, 48, 64];

/** FDCAN Error State Indicator */
export enum ESI {
    /** Node is error active */
    active,
    /** Node is error passive */
    passive
}

/** FDCAN Bit rate switching */
export enum BRS {
    /** Frame tx without BRS */
    off,
    /** Frame tx with BRS */
    on
}

/** Frame format */
export enum Format {
    /** Classic frame format */
    classic,
    /** FD frame format */
    fd
}

export interface TxHeader {
    /**
     * @note Must be between
     *  - 0 and 0x7FF for standard ID
     *  - 0 and 0x1FFFFFFF for extended ID
     */
    identifier: number;
    /** Identifer type for the message */
    idType: IdType;
    /** Type of frame for the message */
    frameType: FrameType;
    /** Frame data length */
    dataLength: DLC;
    /** Error state indicator */
    errorStateIndicator: ESI;
    /** Whether frame will use bit rate switching */
    bitRateSwitch: BRS;
    /** Whether frame will use classic or FD format */
    fdFormat: Format;
}

export type Header = TxHeader;

export interface Message {
    header: Header;
    data: ArrayBuffer | SharedArrayBuffer;
}

const FDCAN_EXTID_Pos = 0;
const FDCAN_EXTID_Msk = 0x1FFFFFFF << FDCAN_EXTID_Pos;
const FDCAN_STDID_Pos = 18;
const FDCAN_STDID_Msk = 0x7FF << FDCAN_STDID_Pos;
const FDCAN_RTR_Pos = 29;
const FDCAN_RTR_Msk = 1 << FDCAN_RTR_Pos;
const FDCAN_XTD_Pos = 30;
const FDCAN_XTD_Msk = 1 << FDCAN_XTD_Pos;
const FDCAN_ESI_Pos = 31;
const FDCAN_ESI_Msk = 1 << FDCAN_ESI_Pos;

const FDCAN_RXTS_Pos = 0;
const FDCAN_RXTS_Msk = 0xFFFF << FDCAN_RXTS_Pos;
const FDCAN_DLC_Pos = 16;
const FDCAN_DLC_Msk = 0x0F << FDCAN_DLC_Pos;
const FDCAN_BRS_Pos = 20;
const FDCAN_BRS_Msk = 1 << FDCAN_BRS_Pos;
const FDCAN_FDF_Pos = 21;
const FDCAN_FDF_Msk = 1 << FDCAN_FDF_Pos;
const FDCAN_FIDX_Pos = 24;
const FDCAN_FIDX_Msk = 0x3F << FDCAN_FIDX_Pos;
const FDCAN_ANMF_Pos = 31;
const FDCAN_ANMF_Msk = 1 << FDCAN_ANMF_Pos;

export function decodeHeader(buf: ArrayBufferLike): Header | null {
    const view = new DataView(buf);

    const lower = view.getUint32(0, true);
    const upper = view.getUint32(4, true);

    const xtd = (lower & FDCAN_XTD_Msk) >> FDCAN_XTD_Pos;

    const idType = xtd === 0 ? IdType.standard : IdType.extended
    const idMask = idType === IdType.standard ? FDCAN_STDID_Msk : FDCAN_EXTID_Msk;
    const idPos = idType === IdType.standard ? FDCAN_STDID_Pos : FDCAN_EXTID_Pos;

    const id = (lower & idMask) >> idPos;
    const rtr = (lower & FDCAN_RTR_Msk) >> FDCAN_RTR_Pos;
    const esi = (lower & FDCAN_ESI_Msk) >> FDCAN_ESI_Pos;

    const rxts = (upper & FDCAN_RXTS_Msk) >> FDCAN_RXTS_Pos;
    const dlc = (upper & FDCAN_DLC_Msk) >> FDCAN_DLC_Pos;
    const brs = (upper & FDCAN_BRS_Msk) >> FDCAN_BRS_Pos;
    const fdf = (upper & FDCAN_FDF_Msk) >> FDCAN_FDF_Pos;
    const fidx = (upper & FDCAN_FIDX_Msk) >> FDCAN_FIDX_Pos;
    const anmf = (upper & FDCAN_ANMF_Msk) >> FDCAN_ANMF_Pos;

    return {
        identifier: id,
        idType,
        frameType: rtr === 0 ? FrameType.data : FrameType.remote,
        dataLength: dlcMap[dlc] ?? 0,
        errorStateIndicator: esi === 0 ? ESI.active : ESI.passive,
        bitRateSwitch: brs === 0 ? BRS.off : BRS.on,
        fdFormat: fdf === 0 ? Format.classic : Format.fd
    };
}