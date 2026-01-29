import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Database, s_dbc } from '@/lib/db/types';
import { DB } from '@/lib/db';

type CRUDStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

interface CRUDOperationState<T = null> {
    status: CRUDStatus;
    error: string | null;
    data: T | null;
}

const crudOperationState = <T = null>({
    status = 'idle',
    error = null,
    data = null,
}: Partial<CRUDOperationState<T>> = {}): CRUDOperationState<T> => ({
    status,
    error,
    data,
});

export interface DBCState {
    dbc: { [id: string]: s_dbc };

    delete: CRUDOperationState;
    fetchAll: CRUDOperationState<s_dbc[]>;
}

export interface DBCSlice {
    dbc: Map<string, s_dbc>;

}

const dbcAdapter = createEntityAdapter();

const initialState = dbcAdapter.getInitialState<DBCState>({
    dbc: {},
    delete: crudOperationState(),
    fetchAll: crudOperationState(),
});

export const fetchAllDBCs = createAsyncThunk(
    'dbc/fetchAll',
    async (db: DB) => await db.selectFrom('dbc').selectAll().execute()
);

export const deleteDBC = createAsyncThunk('dbc/delete', async (payload: { id: s_dbc['id']; db: DB }) => {
    await payload.db.deleteFrom('dbc').where('dbc.id', '=', payload.id).execute();
});

export const dbcSlice = createSlice({
    name: 'dbc',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addAsyncThunk(deleteDBC, {
            pending: (state, action) => {
                state.delete = crudOperationState({ status: 'pending' });
            },
            fulfilled: (state, action) => {
                state.delete = crudOperationState({ status: 'succeeded' });
            },
            rejected: (state, action) => {
                state.delete = crudOperationState({ status: 'failed', error: action.error.message ?? 'Unknown error' });
            },
        });

        builder.addAsyncThunk(fetchAllDBCs, {
            pending: (state, action) => {
                state.fetchAll = crudOperationState({ status: 'pending' });
            },
            fulfilled: (state, action) => {
                state.fetchAll = crudOperationState({ status: 'succeeded', data: action.payload });
            },
            rejected: (state, action) => {
                state.fetchAll = crudOperationState({
                    status: 'failed',
                    error: action.error.message ?? 'Unknown error',
                });
            },
        });
    },
});

export default dbcSlice.reducer;
