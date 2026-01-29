import { sql } from 'kysely';
import { type Migration } from '.';

/**
 * Creates initial DBC tables.
 */
export default {
    version: 1,
    description: 'initial',
    migrate: async (db) => {
        await db.schema
            .createTable('dbc')
            .addColumn('id', 'text', (col) => col.primaryKey().notNull())
            .addColumn('version', 'text', (col) => col.notNull())
            .addColumn('name', 'text', (col) => col.notNull())
            .addColumn('description', 'text', (col) => col.notNull())
            .execute();

        await db.schema
            .createTable('message')
            .addColumn('ecu_id', 'integer', (col) => col.notNull())
            .addColumn('dbc_id', 'text', (col) => col.notNull())
            .addColumn('name', 'text', (col) => col.notNull())
            .addColumn('comment', 'text', (col) => col.notNull())
            .addColumn('length', 'integer', (col) => col.notNull())
            .addColumn('sender', 'text', (col) => col.notNull())
            .addPrimaryKeyConstraint('pk_message', ['ecu_id', 'dbc_id'])
            .addUniqueConstraint('u_name_dbc_id', ['name', 'dbc_id'])
            .addForeignKeyConstraint('fk_message_dbc_id', ['dbc_id'], 'dbc', ['id'], (cb) =>
                cb.onUpdate('cascade').onDelete('cascade')
            )
            .execute();

        await db.schema
            .createTable('signal')
            .addColumn('name', 'text', (col) => col.notNull())
            .addColumn('ecu_id', 'integer', (col) => col.notNull())
            .addColumn('dbc_id', 'text', (col) => col.notNull())
            .addColumn('comment', 'text', (col) => col.notNull())
            .addColumn('bit_start', 'integer', (col) => col.notNull())
            .addColumn('bit_length', 'integer', (col) => col.notNull())
            .addColumn('byte_order', 'text', (col) => col.notNull())
            .addColumn('signed', 'boolean', (col) => col.notNull())
            .addColumn('scale', 'real', (col) => col.notNull())
            .addColumn('offset', 'real', (col) => col.notNull())
            .addColumn('min', 'real')
            .addColumn('max', 'real')
            .addColumn('unit', 'text', (col) => col.notNull())
            .addColumn('receiver', 'text', (col) => col.notNull())
            .addColumn('mux_name', 'text')
            .addColumn('mux_value', 'integer')
            .addPrimaryKeyConstraint('pk_signal', ['name', 'ecu_id', 'dbc_id'])
            .addCheckConstraint('check_mux_name_mux_value', sql`(mux_name IS NULL) = (mux_value IS NULL)`)
            .addCheckConstraint('check_byte_order', sql`(byte_order = 'Intel') OR (byte_order = 'Motorola')`)
            .addForeignKeyConstraint(
                'fk_signal_dbc_id_ecu_id',
                ['dbc_id', 'ecu_id'],
                'message',
                ['dbc_id', 'ecu_id'],
                (cb) => cb.onUpdate('cascade').onUpdate('cascade')
            )
            .addForeignKeyConstraint(
                'fk_signal_mux_name_dbc_id_ecu_id',
                ['mux_name', 'dbc_id', 'ecu_id'],
                'signal',
                ['name', 'dbc_id', 'ecu_id'],
                (cb) => cb.onUpdate('cascade').onUpdate('cascade')
            )
            .execute();
    },
} satisfies Migration;
