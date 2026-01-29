'use client';

import React from 'react';
import * as R from '@radix-ui/themes';

function Asterisk() {
    return (
        <R.Text color="red" size="3" as="span" className="pr-1 select-none">
            *
        </R.Text>
    );
}

export function EditDBCTab() {
    return (
        <R.Tabs.Content value="edit" className="pt-4">
            <R.ScrollArea scrollbars="vertical">
                <R.DataList.Root>
                    <R.DataList.Item>
                        <R.DataList.Label>
                            <R.Tooltip content="A unique ID for the DBC. Required.">
                                <R.Text>
                                    ID
                                    <Asterisk />
                                </R.Text>
                            </R.Tooltip>
                        </R.DataList.Label>
                        <R.DataList.Value>
                            <R.TextField.Root placeholder="org.ufsolargators.can-map" className="w-64" />
                        </R.DataList.Value>
                    </R.DataList.Item>

                    <R.DataList.Item>
                        <R.DataList.Label>
                            <R.Tooltip content="A semver version used to track updates. Required.">
                                <R.Text>
                                    Version
                                    <Asterisk />
                                </R.Text>
                            </R.Tooltip>
                        </R.DataList.Label>
                        <R.DataList.Value>
                            <R.TextField.Root placeholder="1.5.3" className="w-64" />
                        </R.DataList.Value>
                    </R.DataList.Item>

                    <R.DataList.Item>
                        <R.DataList.Label>
                            Name
                            <Asterisk />
                        </R.DataList.Label>
                        <R.DataList.Value>
                            <R.TextField.Root placeholder="Master CAN Map" className="w-64" />
                        </R.DataList.Value>
                    </R.DataList.Item>

                    <R.DataList.Item>
                        <R.DataList.Label>Description</R.DataList.Label>
                        <R.DataList.Value>
                            <R.TextArea className="w-64" />
                        </R.DataList.Value>
                    </R.DataList.Item>
                </R.DataList.Root>

                <R.Text size="4">Messages</R.Text>

                <R.Inset side="x" clip="padding-box">
                    <R.ScrollArea scrollbars="horizontal">
                        <R.Table.Root>
                            <R.Table.Header>
                                <R.Table.RowHeaderCell>CAN ID</R.Table.RowHeaderCell>
                                <R.Table.RowHeaderCell>Name</R.Table.RowHeaderCell>
                                <R.Table.RowHeaderCell>Comment</R.Table.RowHeaderCell>
                                <R.Table.RowHeaderCell>Length</R.Table.RowHeaderCell>
                                <R.Table.RowHeaderCell>Sender</R.Table.RowHeaderCell>
                            </R.Table.Header>

                            <R.Table.Body>
                                <R.Table.Row>
                                    <R.Table.Cell>
                                        <R.TextField.Root defaultValue={0} className="w-12" />
                                    </R.Table.Cell>
                                    <R.Table.Cell>
                                        <R.TextField.Root pattern="" className="w-36" />
                                    </R.Table.Cell>
                                    <R.Table.Cell>
                                        <R.TextArea className="w-24" />
                                    </R.Table.Cell>
                                    <R.Table.Cell>
                                        <R.TextField.Root defaultValue={8} className="w-12" />
                                    </R.Table.Cell>
                                    <R.Table.Cell>
                                        <R.TextField.Root />
                                    </R.Table.Cell>
                                </R.Table.Row>
                            </R.Table.Body>
                        </R.Table.Root>
                    </R.ScrollArea>
                </R.Inset>
            </R.ScrollArea>
        </R.Tabs.Content>
    );
}
