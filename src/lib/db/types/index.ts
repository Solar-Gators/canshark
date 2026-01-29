import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
    _canshark_migration: _canshark_migration;
    dbc: dbc;
    message: message;
    signal: signal;
}

export interface _canshark_migration {
    version: ColumnType<number, number, never>;
    description: ColumnType<string, string, never>;
    /** ISO8601 string */
    installed_on: string;
    success: boolean;
}

export type s__canshark_migration = Selectable<_canshark_migration>;
export type i__canshark_migration = Insertable<_canshark_migration>;
export type u__canshark_migration = Updateable<_canshark_migration>;

export interface dbc {
    id: string;
    version: `${number}.${number}.${number}`;
    name: string;
    description: string;
    source: `${string}/${string}` | null;
    /** ISO8601 string */
    updated: string;
}

export type s_dbc = Selectable<dbc>;
export type i_dbc = Insertable<dbc>;
export type u_dbc = Updateable<dbc>;

export interface message {
    ecu_id: number;
    dbc_id: ColumnType<string, string, never>;
    name: string;
    comment: string;
    length: number;
    sender: string;
}

export type s_message = Selectable<message>;
export type i_message = Insertable<message>;
export type u_message = Updateable<message>;

export enum signal_byte_order {
    Motorola = 0,
    Intel = 1,
}

export interface signal {
    name: string;
    ecu_id: number;
    dbc_id: ColumnType<string, string, never>;
    comment: string;
    bit_start: number;
    bit_length: number;
    byte_order: signal_byte_order;
    signed: number;
    scale: number;
    offset: number;
    min: number | null;
    max: number | null;
    unit: string;
    receiver: string;
    mux_name: signal['name'] | null;
    mux_value: number | null;
}

export type s_signal = Selectable<signal>;
export type i_signal = Insertable<signal>;
export type u_signal = Updateable<signal>;
