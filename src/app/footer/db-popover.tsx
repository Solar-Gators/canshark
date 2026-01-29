'use client';

import React from 'react';
import * as R from '@radix-ui/themes';
import { DatabaseStatus, useDatabase } from '@/lib/db';

const units = ['B', 'KB', 'MB', 'GB'];

/**
 * Formats a byte count to B, KB, MB, or GB.
 * @param bytes the byte count to format
 * @returns formatted byte count
 */
function abbreviateBytes(bytes: number): string {
    for (const unit of units) {
        if (bytes < 1024) return `${bytes.toFixed(2)} ${unit}`;
        bytes /= 1024;
    }

    return `${bytes.toFixed(2)} ${units.at(-1)}`;
}

enum StoragePersistence {
    enabled = 'enabled',
    disabled = 'disabled',
    granted = 'granted',
    denied = 'denied',
    unknown = 'unknown',
}

function DatabaseStatusLabel({ status }: { status: DatabaseStatus }) {
    const [text, className] = {
        [DatabaseStatus.disconnected]: ['Disconnected', 'bg-white'],
        [DatabaseStatus.initialized]: ['Initialized', 'bg-orange-500'],
        [DatabaseStatus.connected]: ['Connected', 'bg-green-500'],
    }[status];

    return (
        <R.Flex align="center" gap="2">
            <div className={`h-1.5 w-1.5 rounded-full ${className}`}></div>
            <R.Text as="span">{text}</R.Text>
        </R.Flex>
    );
}

export function DBPopover() {
    const { status } = useDatabase();

    const [estimate, setEstimate] = React.useState(null as StorageEstimate | null);
    const [persisted, setPersisted] = React.useState<StoragePersistence>(StoragePersistence.unknown);

    React.useEffect(() => {
        navigator.storage
            .persisted()
            .then((p) => setPersisted(p ? StoragePersistence.enabled : StoragePersistence.disabled))
            .catch((err) => {
                console.error('Persistence query error:', err);
            });

        navigator.storage
            .estimate()
            .then((e) => setEstimate(e))
            .catch((err) => {
                console.warn('Failed to get storage estimate:', err);
            });
    }, []);

    const persist = () => {
        navigator.storage
            .persist()
            .then((p) => setPersisted(p ? StoragePersistence.granted : StoragePersistence.denied))
            .catch((err) => {
                console.error('Persistence request failed:', err);
                setPersisted(StoragePersistence.denied);
            });
    };

    let usageText = '\u2013';
    let quotaText = '\u2013';
    if (estimate?.usage !== undefined) usageText = abbreviateBytes(estimate.usage);
    if (estimate?.quota !== undefined) quotaText = abbreviateBytes(estimate.quota);

    return (
        <R.DataList.Root>
            <R.DataList.Item>
                <R.DataList.Label minWidth="3rem">Status</R.DataList.Label>
                <R.DataList.Value>
                    <DatabaseStatusLabel status={status} />
                </R.DataList.Value>
            </R.DataList.Item>

            <R.DataList.Item>
                <R.DataList.Label minWidth="3rem">Usage</R.DataList.Label>
                <R.DataList.Value className="col-start-2">
                    <R.Text as="p">
                        {usageText} / {quotaText}
                    </R.Text>
                </R.DataList.Value>
            </R.DataList.Item>

            <R.DataList.Item>
                <R.DataList.Label>Persistence</R.DataList.Label>
                <R.DataList.Value>
                    {['disabled', 'granted', 'denied'].includes(persisted) ? (
                        <R.Button
                            size="1"
                            onClick={persist}
                            color={persisted === 'disabled' ? undefined : persisted === 'granted' ? 'green' : 'orange'}
                            disabled={['granted', 'denied'].includes(persisted)}
                        >
                            {persisted === 'disabled' ? 'Enable' : persisted === 'granted' ? 'Granted' : 'Denied'}
                        </R.Button>
                    ) : (
                        <R.Text>{persisted}</R.Text>
                    )}
                </R.DataList.Value>
            </R.DataList.Item>
        </R.DataList.Root>
    );

    return (
        <R.Popover.Root>
            <R.Popover.Trigger>
                <R.Button size="1">Database</R.Button>
            </R.Popover.Trigger>

            <R.Popover.Content size="1" width="15rem"></R.Popover.Content>
        </R.Popover.Root>
    );
}
