import { type Migration } from '.';

/**
 * Sets up the migrations table. Do not include in migrations list.
 */
export default {
    version: 0,
    description: 'setup',
    migrate: async (db) => {
        await db.schema
            .createTable('_canshark_migration')
            .addColumn('version', 'integer', (col) => col.primaryKey().notNull())
            .addColumn('description', 'text', (col) => col.notNull())
            .addColumn('installed_on', 'text', (col) => col.notNull())
            .addColumn('success', 'boolean', (col) => col.notNull())
            .execute();
    },
} satisfies Migration;
