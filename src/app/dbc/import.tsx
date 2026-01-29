import { dbcSchema } from '@/schemagen';
import { Button, Dialog, Flex, Text } from '@radix-ui/themes';
import React from 'react';

export function ImportDBCDialog() {
    const dropZone = React.useRef<HTMLLabelElement>(null);

    const onUpload = async (f: (File | null)[]) => {
        const file = f[0];
        if (!file || file.type !== 'application/json') return;

        const text = await file.text();
        const data = JSON.parse(text);
        const schema = await dbcSchema.safeParseAsync(data);
        console.log(schema);
    };

    const onDropZoneDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        const fileItem = [...e.dataTransfer.items].filter((i) => i.kind === 'file')[0];
        if (fileItem) {
            e.preventDefault();
            if (fileItem.type === 'application/json') {
                e.dataTransfer.dropEffect = 'copy';
            } else {
                e.dataTransfer.dropEffect = 'none';
            }
        }
    };

    const onDropZoneDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        const files = [...e.dataTransfer.items].map((i) => i.getAsFile()).filter((f) => f);
        onUpload(files);
    };

    React.useEffect(() => {
        const onDragOver = (e: DragEvent) => {
            const fileItem = [...(e.dataTransfer?.items ?? [])].filter((i) => i.kind === 'file')[0];
            if (fileItem) {
                e.preventDefault();
                if (dropZone.current && !dropZone.current.contains(e.target as Node)) {
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
                }
            }
        };

        window.addEventListener('dragover', onDragOver);

        return () => {
            window.removeEventListener('dragover', onDragOver);
        };
    }, []);

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button variant="ghost">Import</Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="32rem">
                <Dialog.Title>Import</Dialog.Title>

                <Flex pt="4">
                    <Flex className="h-32 cursor-pointer" width="100%" align="center" justify="center" asChild>
                        <Text
                            as="label"
                            onDragOver={onDropZoneDragOver}
                            onDrop={onDropZoneDrop}
                            ref={dropZone}
                            className="rounded-(--radius-4) border-2 border-dashed border-(--accent-7) bg-(--gray-1) text-(--accent-11)"
                        >
                            Drop a JSON DBC file here, or click to upload
                            <input
                                type="file"
                                accept="application/json"
                                className="hidden"
                                onChange={(e) => {
                                    onUpload([...(e.currentTarget.files ?? [])]);
                                }}
                            />
                        </Text>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
