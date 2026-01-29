'use client';

import * as R from '@radix-ui/themes';
import { CheckIcon, DownloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { formatDistanceToNow } from 'date-fns';

export function StoredDBCTab() {
    return (
        <R.Tabs.Content value="stored">
            <R.Table.Root size="1" mt="3" variant="surface">
                <R.Table.Header>
                    <R.Table.Row>
                        <R.Table.ColumnHeaderCell>Name</R.Table.ColumnHeaderCell>
                        <R.Table.ColumnHeaderCell>Updated</R.Table.ColumnHeaderCell>
                        <R.Table.ColumnHeaderCell></R.Table.ColumnHeaderCell>
                    </R.Table.Row>
                </R.Table.Header>

                <R.Table.Body>
                    <R.Table.Row>
                        <R.Table.RowHeaderCell>Master CAN map</R.Table.RowHeaderCell>
                        <R.Table.Cell>
                            <R.Tooltip content={new Date().toLocaleString()}>
                                <R.Text>{formatDistanceToNow(new Date(), { addSuffix: true })}</R.Text>
                            </R.Tooltip>
                        </R.Table.Cell>
                        <R.Table.Cell align="right">
                            <R.Flex align="center" justify="end" height="100%" gapX="2">
                                <R.Tooltip content="Set as default">
                                    <R.IconButton radius="full" size="1" variant="surface">
                                        <CheckIcon />
                                    </R.IconButton>
                                </R.Tooltip>
                                <R.Tooltip content="Download">
                                    <R.IconButton radius="full" size="1" variant="surface">
                                        <DownloadIcon />
                                    </R.IconButton>
                                </R.Tooltip>
                                <R.Tooltip content="Delete">
                                    <R.IconButton radius="full" size="1" variant="surface" color="red">
                                        <TrashIcon />
                                    </R.IconButton>
                                </R.Tooltip>
                            </R.Flex>
                        </R.Table.Cell>
                    </R.Table.Row>
                </R.Table.Body>
            </R.Table.Root>
        </R.Tabs.Content>
    );
}
