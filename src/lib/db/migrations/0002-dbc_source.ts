import { type Migration } from '.';

/**
 *
 */
export default {
    version: 2,
    description: 'dbc_source',
    migrate: async (db) => {
        await db.schema
            .alterTable('dbc')
            .addColumn('source', 'text', (cb) => cb.defaultTo(null))
            .execute();
    },
} satisfies Migration;
