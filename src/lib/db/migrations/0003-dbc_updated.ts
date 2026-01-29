import { type Migration } from '.';

/**
 * Adds an `updated` column to `dbc` storing when the DBC was updated
 */
export default {
    version: 3,
    description: 'dbc_updated',
    migrate: async (db) => {
        await db.schema
            .alterTable('dbc')
            .addColumn('updated', 'text', (cb) => cb.notNull().defaultTo(new Date().toISOString()))
            .execute();
    },
} satisfies Migration;
