'use client';

import { useDatabase, useQuery } from '@/lib/db';
import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Heading, Table } from '@radix-ui/themes';
import { DBCRow } from './dbc-row';
import logger from '@/logger';
import { ImportDBCDialog } from './import';

export default function DBCPage() {
    const { db } = useDatabase();

    const { success: dbc } = useQuery((db) => {
        return db.selectFrom('dbc').selectAll().execute();
    });

    logger.log('#/dbc/page', 'DBC:', dbc);

    const seed = () => {
        void (async () => {
            if (!db) return;

            await db
                .insertInto('dbc')
                .values({
                    id: 'org.ufsolargators.can-map',
                    version: '1.5.3',
                    name: 'Master CAN Map',
                    description: 'A cool description',
                    source: 'Solar-Gators/canshark',
                    updated: new Date().toISOString(),
                })
                .execute()
                .then(() => alert('Seeded database'))
                .catch((err) => {
                    alert('Failed to seed database');
                    console.error(err);
                });
        })();
    };

    return (
        <Flex p="5" gapY="3" className="w-full" direction="column">
            <Flex align="center" justify="end" gapX="5" mb="2">
                <Heading size="6" mr="auto">
                    Stored DBCs
                </Heading>
                <Button variant="ghost" color="orange" onClick={seed}>
                    Seed
                </Button>

                <ImportDBCDialog />

                <Button>
                    <PlusIcon />
                    Create
                </Button>
            </Flex>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell align="right">Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>{dbc?.map((dbc) => <DBCRow dbc={dbc} key={dbc.id} />) ?? <DBCRow />}</Table.Body>
            </Table.Root>
        </Flex>
    );
}
