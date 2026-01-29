import { s_dbc } from '@/lib/db/types';
import { FileTextIcon, GitHubLogoIcon } from '@radix-ui/react-icons';
import { Code, Flex, Link, Skeleton, Table, Text, Tooltip } from '@radix-ui/themes';
import { formatDistanceToNow } from 'date-fns';
import { DBCActions } from './dbc-actions';

const sourcePattern = /^(?<org>[A-Za-z0-9_.-]+)\/(?<repo>[\w\.\-]+)$/;

/**
 * Attempts to create a GitHub repository link from a source string
 * @param source repo source formatted as `org/repo`
 * @returns a link if valid, `null` otherwise
 */
function link(source: string): string | null {
    const match = sourcePattern.exec(source);
    if (!match) return null;

    return `https://github.com/${match.groups!.org}/${match.groups!.repo}`;
}

interface DBCRowProps {
    readonly dbc?: s_dbc | null;
}

export function DBCRow({ dbc = null }: DBCRowProps) {
    const repoLink = dbc?.source ? link(dbc.source) : null;

    return (
        <Table.Row>
            <Table.Cell>
                <Flex direction="column">
                    <Text>
                        {dbc ? (
                            <>
                                Master CAN Map <Code>v1.5.3</Code>
                                {dbc?.description && (
                                    <Tooltip content={dbc.description}>
                                        <Text as="span" ml="2">
                                            <FileTextIcon className="inline-block" />
                                        </Text>
                                    </Tooltip>
                                )}
                            </>
                        ) : (
                            <Skeleton>Master CAN Map v1.0.0</Skeleton>
                        )}
                    </Text>
                    <Text size="1" color="gray" truncate>
                        {dbc?.id ?? <Skeleton>org.ufsolargators.can-map</Skeleton>}
                    </Text>
                </Flex>
            </Table.Cell>

            <Table.Cell>
                <Flex direction="column">
                    {dbc ? (
                        <Flex align="center" gapX="2" asChild>
                            {repoLink ? (
                                <Link target="_blank" href={repoLink}>
                                    <GitHubLogoIcon color="white" />
                                    <Text>{dbc.source}</Text>
                                </Link>
                            ) : (
                                <Text>{dbc.source ?? 'Imported'}</Text>
                            )}
                        </Flex>
                    ) : (
                        <Text>
                            <Skeleton>Solar-Gators/canshark</Skeleton>
                        </Text>
                    )}

                    {dbc ? (
                        <Tooltip content={new Date(dbc.updated).toLocaleString()}>
                            <Text size="1" className="w-fit">
                                Updated {formatDistanceToNow(new Date(dbc.updated), { addSuffix: true })}
                            </Text>
                        </Tooltip>
                    ) : (
                        <Text size="1">
                            <Skeleton>Updated less than a minute ago</Skeleton>
                        </Text>
                    )}
                </Flex>
            </Table.Cell>

            <Table.Cell>
                <DBCActions id={dbc?.id} />
            </Table.Cell>
        </Table.Row>
    );
}
