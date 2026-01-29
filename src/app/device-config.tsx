'use client';

import { GearIcon } from '@radix-ui/react-icons';
import { Box, DataList, Dialog, Flex, Grid, IconButton, Select, Separator, Slider, Text } from '@radix-ui/themes';
import React from 'react';

const constrain = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

/** Fixed FDCAN periphal clock rate in × 1 Hz (80 MHz) */
const FDCAN_CLK_Hz = 80e6;
/** Fixed data bit sync segment length in × t_q */
const DATA_SYNC_SEG_LEN = 1;

/*
    t_q is the actual (time) length of a quantum
    used for all segment length settings.

    Calculated by: `<prescaler> / FDCAN_CLK_Hz`
*/

/** Min data prescaler setting */
const DATA_PRESCALER_MIN = 1;
/** Max data prescaler setting */
const DATA_PRESCALER_MAX = 32;
/** Default data prescaler setting */
const DATA_PRESCALER_DEFAULT = 16;

/** Max data segment 1 length in × t_q */
const DATA_SEG1_LEN_MAX = 32;
/** Max data segment 2 length in × t_q */
const DATA_SEG2_LEN_MAX = 16;
/** Min data segment 1/2 length in × t_q */
const DATA_SEG_LEN_MIN = 1;

/** Max data bit length in × t_q */
const DATA_BIT_MAX_LEN = DATA_SYNC_SEG_LEN + DATA_SEG1_LEN_MAX + DATA_SEG2_LEN_MAX;

/** Default data segment 1 length in × t_q */
const DATA_SEG1_LEN_DEFAULT = 2;
/** Default data segment 2 length in × t_q */
const DATA_SEG2_LEN_DEFAULT = 2;

/** Max data segment jump width in × t_q */
const DATA_SJW_MAX = 16;

export function DeviceConfigDialog() {
    const [dataPrescaler, setPrescaler] = React.useState(DATA_PRESCALER_DEFAULT);
    const [[dataSyncSegEnd, dataSeg1End, dataSeg2End], setDataSegments] = React.useState<[number, number, number]>([
        DATA_SYNC_SEG_LEN,
        DATA_SEG1_LEN_DEFAULT,
        DATA_SEG2_LEN_DEFAULT,
    ]);

    const dataSyncSegLength = dataSyncSegEnd;
    const dataSeg1Start = dataSyncSegEnd;
    const dataSeg1Length = dataSeg1End - dataSeg1Start;
    const dataSeg2Start = dataSeg1End;
    const dataSeg2Length = dataSeg2End - dataSeg2Start;
    const dataBitLength = dataSeg2End;

    const sliderSetPrescaler = (value: number[]) => {
        if (value[0] !== undefined) setPrescaler(value[0]);
    };

    const sliderSetDataSegments = (value: number[]) => {
        let [syncSegEnd, seg1End, seg2End] = value;
        if (!syncSegEnd || !seg1End || !seg2End) return;

        syncSegEnd = DATA_SYNC_SEG_LEN;
        seg1End = constrain(seg1End - syncSegEnd, DATA_SEG_LEN_MIN, DATA_SEG1_LEN_MAX) + syncSegEnd;
        seg2End = constrain(seg2End - seg1End, DATA_SEG_LEN_MIN, DATA_SEG2_LEN_MAX) + seg1End;

        setDataSegments([syncSegEnd, seg1End, seg2End]);
    };

    const prescalerLabelPos = constrain((100 * (dataPrescaler - DATA_PRESCALER_MIN)) / DATA_PRESCALER_MAX, 10, 90);

    /** Data quantum length in nanoseconds */
    const dataT_q_ns = (1e9 * dataPrescaler) / FDCAN_CLK_Hz;
    const dataT_SyncSeg_ns = dataSyncSegLength * dataT_q_ns;
    const dataT_BS1_ns = dataSeg1Length * dataT_q_ns;
    const dataT_BS2_ns = dataSeg2Length * dataT_q_ns;
    const dataT_bit_ns = dataBitLength * dataT_q_ns;

    const dataTSyncSegLabelPos = 100 * (dataSyncSegLength / DATA_BIT_MAX_LEN);
    const dataTBS1LabelPos = (100 * dataSeg1Length) / DATA_BIT_MAX_LEN;
    const dataTBS2LabelPos = (100 * dataSeg2Length) / DATA_BIT_MAX_LEN;
    const dataBaudRate = 1e9 / dataT_bit_ns;

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <IconButton variant="ghost" color="gray" size="2">
                    <GearIcon width="18" height="18" />
                </IconButton>
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Title>Capture Settings</Dialog.Title>
                <DataList.Root>
                    <DataList.Item>
                        <DataList.Label>FDCAN Frame Format</DataList.Label>
                        <DataList.Value>
                            <Select.Root name="fdcan_frame_format" size="1">
                                <Select.Trigger placeholder="Loading" />
                                <Select.Content>
                                    <Select.Item value="classic">Classic</Select.Item>
                                    <Select.Item value="fd_no_brs">FD w/o BRS</Select.Item>
                                    <Select.Item value="fd_brs">FD w/ BRS</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </DataList.Value>
                    </DataList.Item>
                    <DataList.Item align="end">
                        <DataList.Label>FDCAN Mode</DataList.Label>
                        <DataList.Value>
                            <Select.Root name="fdcan_mode" size="1">
                                <Select.Trigger placeholder="Loading" />
                                <Select.Content>
                                    <Select.Item value="normal">Normal</Select.Item>
                                    <Select.Item value="restricted">Restricted</Select.Item>
                                    <Select.Item value="bus_monitoring">Bus Monitoring</Select.Item>
                                    <Select.Item value="internal_loopback">Internal Loopback</Select.Item>
                                    <Select.Item value="external_loopback">External Loopback</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </DataList.Value>
                    </DataList.Item>
                    <DataList.Item align="end">
                        <DataList.Label>Auto-Retransmission</DataList.Label>
                        <DataList.Value>
                            <Box minWidth="4rem">
                                <Select.Root name="fdcan_auto_retransmission" size="1">
                                    <Select.Trigger placeholder="Loading" />
                                    <Select.Content>
                                        <Select.Item value="enable">Enabled</Select.Item>
                                        <Select.Item value="disable">Disable</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            </Box>
                        </DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.Label className="font-bold">Data Bit Timing</DataList.Label>
                        <DataList.Value>
                            <DataList.Root className="min-h-14 w-full">
                                <DataList.Item>
                                    <DataList.Label>Prescaler</DataList.Label>
                                    <DataList.Value className="min-h-14">
                                        <Grid gapY="2" columns="1fr" rows="auto 1fr" width="100%">
                                            <Slider
                                                min={DATA_PRESCALER_MIN}
                                                max={DATA_PRESCALER_MAX}
                                                value={[dataPrescaler]}
                                                onValueChange={sliderSetPrescaler}
                                            />
                                            <Grid
                                                width="100%"
                                                columns="auto 1fr 3fr auto"
                                                gapX="2"
                                                justify="between"
                                                position="relative"
                                                px="4px"
                                            >
                                                <Separator orientation="vertical" />
                                                <Text as="span" align="center">
                                                    {dataPrescaler}
                                                </Text>
                                                <Text as="span">
                                                    t<sub>q</sub> = {dataT_q_ns.toString()} ns
                                                </Text>
                                                <Separator orientation="vertical" />
                                            </Grid>
                                        </Grid>
                                    </DataList.Value>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.Label>Segment Length</DataList.Label>
                                    <DataList.Value>
                                        <Grid gapY="2" columns="1fr" rows="auto 1fr" width="100%">
                                            <Slider
                                                value={[dataSyncSegEnd, dataSeg1End, dataSeg2End]}
                                                size="1"
                                                onValueChange={sliderSetDataSegments}
                                                minStepsBetweenThumbs={DATA_SEG_LEN_MIN}
                                                max={DATA_BIT_MAX_LEN}
                                            />
                                            <Grid
                                                columns={`1px ${String(dataTSyncSegLabelPos)}% 1fr`}
                                                px="4px"
                                                width="100%"
                                            >
                                                <div></div>
                                                <Flex
                                                    align="center"
                                                    data-accent-color="gray"
                                                    className="h-(--space-4) border-r border-l border-(--accent-a6)"
                                                >
                                                    <Separator orientation="horizontal" size="4" />
                                                </Flex>
                                                <Text size="1" ml="2">
                                                    t<sub>SyncSeg</sub> = {dataT_SyncSeg_ns.toString()} ns (
                                                    {dataSyncSegLength} t<sub>q</sub>)
                                                </Text>
                                            </Grid>
                                            <Grid
                                                columns={`${String(dataTSyncSegLabelPos)}% ${String(dataTBS1LabelPos)}% 1fr`}
                                                px="4px"
                                                width="100%"
                                            >
                                                <div></div>
                                                <Flex
                                                    align="center"
                                                    data-accent-color="gray"
                                                    className="h-(--space-4) border-r border-l border-(--accent-a6)"
                                                >
                                                    <Separator orientation="horizontal" size="4" />
                                                </Flex>
                                                <Text size="1" ml="2">
                                                    t<sub>BS1</sub> = {dataT_BS1_ns} ns ({dataSeg1Length} t<sub>q</sub>)
                                                </Text>
                                            </Grid>
                                            <Grid
                                                columns={`calc(${String(dataTSyncSegLabelPos + dataTBS1LabelPos)}% - 1px) ${String(dataTBS2LabelPos)}% 1fr`}
                                                px="4px"
                                                width="100%"
                                            >
                                                <div></div>
                                                <Flex
                                                    align="center"
                                                    data-accent-color="gray"
                                                    className="h-(--space-4) border-r border-l border-(--accent-a6)"
                                                >
                                                    <Separator orientation="horizontal" size="4" />
                                                </Flex>
                                                <Text size="1" ml="2">
                                                    t<sub>BS2</sub> = {dataT_BS2_ns} ns ({dataSeg2Length} t<sub>q</sub>)
                                                </Text>
                                            </Grid>
                                        </Grid>
                                    </DataList.Value>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.Label>Result</DataList.Label>
                                    <DataList.Value>
                                        <DataList.Root size="1">
                                            <DataList.Item>
                                                <DataList.Label>Time for one bit</DataList.Label>
                                                <DataList.Value>{dataT_bit_ns.toString()} ns</DataList.Value>
                                            </DataList.Item>
                                            <DataList.Item>
                                                <DataList.Label>Baud Rate</DataList.Label>
                                                <DataList.Value>{dataBaudRate.toString()} bit/s</DataList.Value>
                                            </DataList.Item>
                                        </DataList.Root>
                                    </DataList.Value>
                                </DataList.Item>
                            </DataList.Root>
                        </DataList.Value>
                    </DataList.Item>
                </DataList.Root>
            </Dialog.Content>
        </Dialog.Root>
    );
}
