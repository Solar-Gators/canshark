'use client';

import { DatabaseContext, useCreateDatabase } from '@/lib/db';
import React from 'react';

interface DBProviderProps {
    readonly children: React.ReactNode;
}

/**
 * Manages and provides a database instance through React Context.
 * This should wrap root layout children as high as needed, as the layout
 * being a server component precludes storing the instance there.
 */
export function DBProvider({ children }: DBProviderProps) {
    const db = useCreateDatabase();

    return <DatabaseContext value={db}>{children}</DatabaseContext>;
}
