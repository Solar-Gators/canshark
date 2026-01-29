'use client';

import { PaperPlaneIcon, PauseIcon, PlayIcon, StopIcon } from '@radix-ui/react-icons';
import { Box, Flex, Grid, IconButton, ScrollArea, Section, Table, Text, TextField } from '@radix-ui/themes';
import React from 'react';
import { useStore } from '@/lib/store/store';
import logger from '@/logger';
import { reset, startCapture, stopCapture } from '@/usb/cmd';
import { IN_EP } from '@/usb/defs';
import { BRS, decodeHeader, Format, FrameType, IdType, Message } from '@/usb/fdcan';
import { DeviceConfigDialog } from './device-config';

enum CaptureState {
    stopped,
    paused,
    capturing,
    suspended,
}

export default function MainPage() {
    const activeDevice = useStore((state) => state.activeDevice);

    const [stateTransition, setStateTransition] = React.useState<[Promise<unknown>, CaptureState] | null>(null);
    const [captureState, setCaptureState] = React.useState(CaptureState.suspended);

    const idRef = React.useRef<HTMLInputElement>(null);
    const dataRef = React.useRef<HTMLInputElement>(null);

    const onDataInput = React.useCallback((ev: React.InputEvent<HTMLInputElement>) => {
        const value = ev.currentTarget.value;

        if (value.length && (value.length + 1) % 3 === 0) {
            ev.currentTarget.value += ' ';
        }

        ev.currentTarget.value = (
            ev.currentTarget.value
                .replace(/[a-f]/g, (c) => c.toUpperCase())
                .replace(/[^A-F0-9]/g, '')
                .match(/..?/g) ?? []
        ).join(' ');
    }, []);

    const onHexKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        const { value } = ev.currentTarget;

        const selectionStart = ev.currentTarget.selectionStart ?? 0;
        const selectionEnd = ev.currentTarget.selectionEnd ?? 0;
        const selectionLength = selectionEnd > selectionStart ? selectionEnd - selectionStart : 1;

        if (ev.key === 'Backspace') {
            if (selectionStart > 1 && selectionStart % 3 === 0) {
                ev.preventDefault();

                // eslint-disable-next-line @typescript-eslint/no-misused-spread
                const chars = [...value];
                chars.splice(selectionStart - 2, selectionLength + 1);
                ev.currentTarget.value = chars.join('');

                ev.currentTarget.value = (
                    ev.currentTarget.value
                        .replace(/[a-f]/g, (c) => c.toUpperCase())
                        .replace(/[^A-F0-9]/g, '')
                        .match(/..?/g) ?? []
                ).join(' ');
            }
        }
    };

    const [messages, setMessages] = React.useState<{ seq: number; msg: Message }[]>([]);

    const POOL_SIZE = 100;
    const pool = React.useRef(Array<Promise<void> | null>(POOL_SIZE).fill(null));
    const initPool = () => {
        pool.current = Array.from({ length: POOL_SIZE }, () => null);
    };

    const processIN = (i: number) => (res: USBInTransferResult) => {
        if (!pool.current[i]) {
            console.debug('Capture IN aborted');
            return;
        }

        if (res.status !== 'ok') {
            logger.log('Collector', 'Transfer error:', res.status);
            setTimeout(dispatchWorker(i), 100);
            return;
        }
        if (!res.data?.byteLength) {
            logger.log('Collector', 'Received ZLP');
            return;
        }
        if (res.data.byteLength < 8) {
            logger.log('Collector', 'Packet too short:', res.data);
            return;
        }

        // console.log([...new Uint8Array(res.data.buffer)]);

        const header = decodeHeader(res.data.buffer);
        if (!header) {
            logger.log('Collector', 'Failed to decode header');
            return;
        }

        dispatchWorker(i)();

        const data = res.data.buffer.slice(8);
        const message: Message = { header, data };
        setMessages((s) => {
            const seq = (s.at(0)?.seq ?? -1) + 1;
            const arr = [{ seq, msg: message }, ...s];
            if (s.length >= 100) {
                return arr.slice(0, arr.length - 2);
            }
            return arr;
        });
    };

    const dispatchWorker = React.useCallback(
        (i: number) => {
            if (!activeDevice) return () => {};
            return () => {
                pool.current[i] = activeDevice.device
                    .transferIn(IN_EP, 4 * 72)
                    .then(processIN(i))
                    .catch(() => {
                        pool.current[i] = null;
                    });
            };
        },
        [activeDevice]
    );

    const startPool = React.useCallback(() => {
        if (!activeDevice) return;
        for (let i = 0; i < POOL_SIZE; i++) {
            dispatchWorker(i)();
        }
    }, [activeDevice]);

    React.useEffect(() => {
        setTimeout(() => {
            logger.log('Capture', activeDevice ? 'Starting pool' : 'No active device');
            if (!activeDevice) return;

            void reset(activeDevice.device)
                .then(() => {
                    logger.log('Capture', 'Successfully reset device');
                    startPool();
                })
                .catch((err: unknown) => {
                    logger.log('Capture', 'Failed to reset device:', err);
                    initPool();
                });
        }, 10);
    }, [activeDevice]);

    React.useEffect(() => {
        if (stateTransition) {
            const [transition, newState] = stateTransition;
            void transition.then(() => {
                setStateTransition((previous) => {
                    if (previous?.[0] === transition) {
                        setCaptureState(newState);
                        return null;
                    }

                    return previous;
                });
            });
        }
    }, [stateTransition]);

    const start = () => {
        if (!activeDevice) {
            console.debug('No active device');
            return;
        }
        setStateTransition([startCapture(activeDevice.device), CaptureState.capturing]);
        startPool();
    };

    const pause = () => {
        if (!activeDevice) {
            console.debug('No active device');
            return;
        }
        setStateTransition([stopCapture(activeDevice.device), CaptureState.paused]);
    };

    const stop = () => {
        if (!activeDevice) {
            console.debug('No active device');
            return;
        }
        setStateTransition([
            stopCapture(activeDevice.device).then(() => {
                setMessages([]);
            }),
            CaptureState.stopped,
        ]);
        initPool();
    };

    React.useEffect(() => {
        if (activeDevice && captureState === CaptureState.suspended) {
            setCaptureState(CaptureState.stopped);
        } else if (!activeDevice) {
            setCaptureState(CaptureState.suspended);
        }

        console.log('Active device:', activeDevice);
    }, [activeDevice]);

    const canStart = captureState !== CaptureState.suspended && captureState !== CaptureState.capturing;
    const canPause = captureState === CaptureState.capturing;
    const canStop = captureState === CaptureState.capturing || captureState === CaptureState.paused;

    return (
        <Grid rows="auto 1fr">
            <Section
                px="4"
                py="2"
                className="sticky top-12 left-0 z-10 border-b border-b-(--gray-a3) bg-(--gray-a1) backdrop-blur-sm"
            >
                <Flex align="center" justify="between">
                    <Flex gapX="3" align="center">
                        <IconButton
                            variant="ghost"
                            color={canStart ? 'grass' : 'gray'}
                            disabled={!canStart && !canPause}
                            size="2"
                            onClick={() => {
                                if (canPause) {
                                    pause();
                                } else {
                                    start();
                                }
                            }}
                        >
                            {canPause ? <PauseIcon width="18" height="18" /> : <PlayIcon width="18" height="18" />}
                        </IconButton>

                        <IconButton
                            variant="ghost"
                            color="red"
                            size="2"
                            disabled={!canStop}
                            onClick={() => {
                                stop();
                            }}
                        >
                            <StopIcon width="18" height="18" />
                        </IconButton>

                            <DeviceConfigDialog />

                    </Flex>
                    <Flex gapX="2" align="center">
                        <Box maxWidth="75px">
                            <TextField.Root
                                placeholder="ID"
                                autoComplete="off"
                                autoCapitalize="off"
                                autoCorrect="off"
                                minLength={1}
                                maxLength={8}
                                pattern=""
                                ref={idRef}
                            ></TextField.Root>
                        </Box>
                        <TextField.Root
                            placeholder="Data"
                            onKeyDown={onHexKeyDown}
                            onInput={onDataInput}
                            ref={dataRef}
                        ></TextField.Root>
                        <IconButton variant="ghost" size="2" ml="2">
                            <PaperPlaneIcon width="18" height="18" />
                        </IconButton>
                    </Flex>

                    <Box></Box>
                </Flex>
            </Section>

            <ScrollArea scrollbars="vertical" asChild>
                <Section className="grow bg-(--gray-2)" p="0">
                    <Table.Root size="1">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>DLC</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Data</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {messages.map(({ seq, msg }, i) => (
                                <Table.Row key={i}>
                                    <Table.Cell className="font-mono">{seq}</Table.Cell>
                                    <Table.Cell className="font-mono">
                                        <Flex gapX="2">
                                            {msg.header.identifier.toString(16)}
                                            <Text as="span" className="rounded-sm bg-blue-700 px-0.75 text-xs">
                                                {msg.header.idType === IdType.standard ? '11' : '29'}b
                                            </Text>
                                            <Text as="span" className="rounded-sm bg-gray-700 px-0.75 text-xs">
                                                {msg.header.frameType === FrameType.data ? 'D' : 'R'}
                                            </Text>
                                            <Text as="span" className="rounded-sm bg-amber-800 px-0.75 text-xs">
                                                {msg.header.bitRateSwitch === BRS.on ? 'BRS' : 'No BRS'}
                                            </Text>
                                            <Text as="span" className="rounded-sm bg-lime-700 px-0.75 text-xs">
                                                {msg.header.fdFormat === Format.classic ? 'Classic' : 'FD'}
                                            </Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>{msg.header.dataLength}</Table.Cell>
                                    <Table.Cell className="font-mono">
                                        {[...new Uint8Array(msg.data)]
                                            .map((n) => n.toString(16).padStart(2, '0'))
                                            .join(' ')}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Section>
            </ScrollArea>
        </Grid>
    );
}
