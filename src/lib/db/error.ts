/**
 * Error codes returned by
 * {@link https://www.sqlite.org/c3ref/c_abort.html|SQLite}
 */
export enum SQLITE_ERROR {
    /** Successful result */
    SQLITE_OK = 0,
    /** Generic error */
    SQLITE_ERROR,
    /** Internal logic error in SQLite */
    SQLITE_INTERNAL,
    /** Access permission denied */
    SQLITE_PERM,
    /** Callback routine requested an abort */
    SQLITE_ABORT,
    /** The database file is locked */
    SQLITE_BUSY,
    /** A table in the database is locked */
    SQLITE_LOCKED,
    /** A malloc() failed */
    SQLITE_NOMEM,
    /** Attempt to write a readonly database */
    SQLITE_READONLY,
    /** Operation terminated by sqlite3_interrupt() */
    SQLITE_INTERRUPT,
    /** Some kind of diso I/O error occurred */
    SQLITE_IOERR,
    /** The database disk image is malformed */
    SQLITE_CORRUPT,
    /** Unknown opcode in sqlite3_file_control() */
    SQLITE_NOTFOUND,
    /** Insertion failed because database is full */
    SQLITE_FULL,
    /** Unable to open the database file */
    SQLITE_CANTOPEN,
    /** Database lock protocol error */
    SQLITE_PROTOCOL,
    /** Internel use only */
    SQLITE_EMPTY,
    /** The database schema changed */
    SQLITE_SCHEMA,
    /** Strong or BLOB exceeds size limit */
    SQLITE_TOOBIG,
    /** Abort due to constraint violation */
    SQLITE_CONSTRAINT,
    /** Data type mismatch */
    SQLITE_MISMATCH,
    /** Library used incorrectly */
    SQLITE_MISUSE,
    /** Uses OS features not supported on host */
    SQLITE_NOLFS,
    /** Authorization denied */
    SQLITE_AUTH,
    /** Not used */
    SQLITE_FORMAT,
    /** 2nd parameter to sqlite3_bind out of range */
    SQLITE_RANGE,
    /** File opened that was not a database file */
    SQLITE_NOTADB,
    /** Notifications from sqlite3_log() */
    SQLITE_NOTICE,
    /** Warnings from sqlite3_log() */
    SQLITE_WARNING,
    /** sqlite3_step() has another row ready */
    SQLITE_ROW,
    /** sqlite3_step() has finished executing */
    SQLITE_DONE,
}

/**
 * Prefix for "table does not exist" error messages
 */
const tableDoesNotExistPrefix = 'SQLITE_ERROR: sqlite3 result code 1: no such table: ';

/**
 * Checks if an `unknown` is a "table does not exist" error
 * @param err a caught error
 * @returns the non-existent table name
 */
export function tableDoesNotExist(err: unknown): string | null {
    if (!Error.isError(err)) return null;
    if (!err.message.startsWith(tableDoesNotExistPrefix)) return null;
    return err.message.slice(tableDoesNotExistPrefix.length);
}
