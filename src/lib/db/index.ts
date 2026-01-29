'use client';

import { Kysely, sql } from 'kysely';
import React from 'react';
import { SQLocalKysely } from 'sqlocal/kysely';

import logger from '@/logger';
import { migrate } from './migrations';
import { type Database } from './types';

export type DB = Kysely<Database>;

/**
 * SQLocal database status
 */
export enum DatabaseStatus {
    disconnected,
    initialized,
    connected,
}

/**
 * Value contained within `DatabaseContext`
 */
export interface DatabaseContextValue {
    db: DB | null;
    status: DatabaseStatus;
}

/**
 * Context providing a database handle.
 */
export const DatabaseContext = React.createContext<DatabaseContextValue>({
    db: null,
    status: DatabaseStatus.disconnected,
});

/**
 * Initializes the database and applies migrations.
 * @returns database when ready, otherwise null
 */
export function useCreateDatabase() {
    const [db, setDB] = React.useState(null as DB | null);
    const [status, setStatus] = React.useState(DatabaseStatus.disconnected);

    React.useEffect(() => {
        void (async () => {
            const { dialect, getDatabaseInfo } = new SQLocalKysely({
                databasePath: 'database.sqlite3',
                onInit: () => {
                    setStatus(DatabaseStatus.initialized);
                },
                onConnect: (reason) => {
                    setStatus(DatabaseStatus.connected);
                    console.debug(`Connected to sqlite database (reason: ${reason})`);
                },
            });

            logger.log('Database', await getDatabaseInfo());

            //@ts-expect-error TS complains about dialect
            const db = new Kysely<Database>({ dialect });

            // Enable foreign keys
            await sql`PRAGMA foreign_keys = ON`.execute(db);

            await migrate(db);

            setDB(db);
        })();
    }, []);

    return { db, status };
}

/**
 * Gets the database handle from the enclosing `DatabaseContext`.
 * @returns database handle or `null`
 */
export function useDatabase(): DatabaseContextValue {
    return React.useContext(DatabaseContext);
}

interface UseQueryReturn<T> {
    success: T | null;
    error: unknown;
    run: (cb?: (db: DB) => Promise<T>) => void;
}

/**
 * Gets a database handle then executes a query.
 * @param cb query callback
 * @returns object containing Promise value and function to run another query
 */
export function useQuery<T>(cb?: (db: DB) => Promise<T>): UseQueryReturn<T> {
    const { db: database } = useDatabase();
    const [run, setRun] = React.useState<((db: DB) => Promise<T>) | undefined>(cb ? () => cb : cb);
    const [[success, error], setResult] = React.useState<[T | null, unknown]>([null, null]);

    React.useEffect(() => {
        if (!database || !run) return;
        run(database)
            .then((res) => {
                setResult([res, null]);
            })
            .catch((rej) => {
                setResult([null, rej]);
            });
    }, [database, run]);

    return {
        success,
        error,
        run: (newCb = cb) => {
            setRun(() => newCb);
        }
    };
}
