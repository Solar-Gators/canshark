import React from 'react';
import { type s_dbc } from '@/lib/db/types';
import { CheckIcon, DotsHorizontalIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { AlertDialog, Flex, IconButton, Tooltip, Button, Skeleton, DropdownMenu } from '@radix-ui/themes';
import { useQuery } from '@/lib/db';

interface DBCActionsProps {
    readonly id?: s_dbc['id'];
}

export function DBCActions({ id }: DBCActionsProps) {
    const [loading, setLoading] = React.useState(false);

    const { run } = useQuery<void>();

    const deleteDBC = () => {
        if (!id) return;
        run(async (db) => {
            await db.deleteFrom('dbc').where('id', '=', id).execute();
        });
    };

    return (
        <Flex align="center" justify="end" gapX="2">
            <Tooltip content="Set as default">
                <Skeleton loading={!id}>
                    <IconButton radius="full" variant="soft" color="bronze">
                        <CheckIcon width={20} height={20} />
                    </IconButton>
                </Skeleton>
            </Tooltip>

            <Tooltip content="Edit">
                <Skeleton loading={!id}>
                    <IconButton radius="full" variant="soft">
                        <Pencil2Icon width={16} height={16} />
                    </IconButton>
                </Skeleton>
            </Tooltip>

            <AlertDialog.Root>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        {(() => {
                            const button = (
                                <IconButton radius="full" variant="soft" color="gray">
                                    <DotsHorizontalIcon width={16} height={16} />
                                </IconButton>
                            );
                            if (!id) return <Skeleton>{button}</Skeleton>;
                            return button;
                        })()}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <AlertDialog.Trigger>
                            <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
                        </AlertDialog.Trigger>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <AlertDialog.Content maxWidth="22rem">
                    <AlertDialog.Title>Delete DBC</AlertDialog.Title>
                    <AlertDialog.Description>
                        Are you sure you want to delete this DBC? This action is irreversible.
                    </AlertDialog.Description>

                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button variant="solid" color="red" onClick={deleteDBC}>
                                Delete DBC
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Flex>
    );
}
