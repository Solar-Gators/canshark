import m0000 from './0000-setup';
import m0001 from './0001-initial';
import m0002 from './0002-dbc_source';
import m0003 from './0003-dbc_updated';

import { DB } from '..';
import { tableDoesNotExist } from '../error';
import { s__canshark_migration } from '../types';

export interface Migration {
    version: number;
    description: string;
    migrate: (db: DB) => PromiseLike<void> | void;
}

const migrations: Migration[] = [m0001, m0002, m0003];

/**
 * Runs a single migration and inserts a migration record.
 * @param migration the migration to run
 * @param db the database to run the migration on
 * @returns whether the migration succeeded
 */
async function run({ migrate, version, description }: Migration, db: DB): Promise<boolean> {
    let success = false;

    try {
        await migrate(db);
        success = true;

        console.debug(`Successfully applied migration ${String(version)}:${description}`);
    } catch (err) {
        console.error(`Migration ${String(version)}:${description} failed:`, err);
    }

    await db
        .insertInto('_canshark_migration')
        .values({
            version,
            description,
            installed_on: new Date().toISOString(),
            success,
        })
        .execute();

    return success;
}

/**
 * Fetches all migration records.
 * @param db the database to fetch from
 * @returns an array of migration records
 */
async function getMigrations(db: DB): Promise<s__canshark_migration[]> {
    return db.selectFrom('_canshark_migration').selectAll().orderBy('version', 'asc').execute();
}

/**
 * Sets up a database for migrations by creating the migrations table and returning all rows.
 * @param db the database to set up migrations for
 * @returns an array of migration records
 */
async function setUpMigrations(db: DB): Promise<s__canshark_migration[]> {
    try {
        return await getMigrations(db);
    } catch (err) {
        const missingTable = tableDoesNotExist(err);
        if (missingTable === '_canshark_migration') {
            await m0000.migrate(db);
        } else {
            console.error(err);
        }

        return getMigrations(db);
    }
}

/**
 * Applies unapplied or failed previously-failed migrations.
 * @param db the database to migrate
 */
export async function migrate(db: DB) {
    const records = await setUpMigrations(db);

    console.debug(
        'Migrations:\n',
        records
            .map(
                (r) =>
                    `${String(r.version)}:${r.description} ${r.success ? 'success' : 'fail'} at ${new Date(r.installed_on).toLocaleString()}`
            )
            .join('\n')
    );

    const startIndex = migrations.findIndex((_, i) => {
        const record = records[i];
        return !record || !record.success;
    });

    if (startIndex === -1) {
        console.debug('There are no pending migrations');
    } else {
        console.debug(`Starting migrations at ${String(migrations[startIndex]?.version)}`);
        for (let i = startIndex; i < migrations.length; i++) {
            const migration = migrations[i];
            if (migration) {
                await run(migration, db);
            }
        }
    }
}
