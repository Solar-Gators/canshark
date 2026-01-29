'use client';

import React from 'react';
import * as R from '@radix-ui/themes';

import { StoredDBCTab } from './stored';
import { ImportDBCTab } from './import';
import { EditDBCTab } from './edit';

export function DBCDialog() {
    return (
        <R.Dialog.Root>
            <R.Dialog.Trigger>
                <R.Button size="1" variant="ghost">
                    Manage DBCs
                </R.Button>
            </R.Dialog.Trigger>

            <R.Dialog.Content>
                <R.Dialog.Title>Manage DBCs</R.Dialog.Title>

                <R.Tabs.Root>
                    <R.Tabs.List>
                        <R.Tabs.Trigger value="stored">Stored</R.Tabs.Trigger>
                        <R.Tabs.Trigger value="edit">Edit</R.Tabs.Trigger>
                        <R.Tabs.Trigger value="import">Import</R.Tabs.Trigger>
                    </R.Tabs.List>

                    <R.Box>
                        <StoredDBCTab />
                        <EditDBCTab />
                        <ImportDBCTab />
                    </R.Box>
                </R.Tabs.Root>
            </R.Dialog.Content>
        </R.Dialog.Root>
    );
}
