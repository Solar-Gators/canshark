import { z } from 'zod';
import { transformFlexibleInt } from './helpers';

const vector_xxx = 'Vector__XXX';

// TODO: fix "endianness"
const endianness = z.enum(['big', 'little']).meta({
    id: 'endianness',
    title: 'Endianness',
    description: 'Indicates the endianness of a multi-byte value',
});

export const nameRegex = /^[0-9A-Za-z_]{1,23}$/;
const name = z.string().regex(nameRegex).meta({
    id: 'name',
    title: 'Name',
    description: 'A name',
});

const binaryString = z
    .string()
    .regex(/^[01]+b$/)
    .transform(transformFlexibleInt(2))
    .meta({
        id: 'binary_string',
        title: 'Binary string',
        description: 'A binary number followed by "b"',
    });

const decimalString = z
    .string()
    .regex(/^[0-9]+$/)
    .transform(transformFlexibleInt(10, 0))
    .meta({
        id: 'decimal_string',
        title: 'Decimal string',
        description: 'A decimal number',
    });

const hexString = z
    .string()
    .regex(/^[0-9A-Fa-f]+h$/)
    .transform(transformFlexibleInt(16))
    .meta({
        id: 'hex_string',
        title: 'Hex string',
        description: 'A hex number followed by "h"',
    });

const octalString = z
    .string()
    .regex(/^[0-8]+o$/)
    .transform(transformFlexibleInt(8))
    .meta({
        id: 'octal_string',
        title: 'Octal string',
        description: 'An octal number followed by "o"',
    });

const intString = z.union([binaryString, decimalString, hexString, octalString]).meta({
    id: 'int_string',
    title: 'Int string',
    description: 'A binary, decimal, hex, or octal number',
});

const flexibleInt = z.union([z.number(), intString]).meta({
    id: 'flexible_int',
    title: 'Flexible int',
    description: 'An integer literal or binary, decimal, hex, or octal string',
});

const signal = z
    .object({
        name: name,
        comment: z.string().default(''),
        bitStart: z.int().min(0),
        bitLength: z.int().min(1),
        endianness: endianness,
        signed: z.boolean(),
        scale: z.number().default(1),
        offset: z.number().default(0),
        min: z.number(),
        max: z.number(),
        unit: z.string().nullable().default(null),
        receiver: name.default(vector_xxx),
        mux: z.tuple([name, flexibleInt]).meta({
            description:
                'Selects a multiplexer. This signal is valid when the named mux value matches the flexible int value.',
        }),
    })
    .meta({
        id: 'signal',
        title: 'Signal',
        description: 'A signal transmitted within a CAN message from a single ECU',
    });

const message = z
    .object({
        id: z.int(),
        name: name,
        comment: z.string().default(''),
        length: z.int().min(0).max(1785),
        sender: name,
        signals: z.array(signal),
    })
    .meta({
        id: 'message',
        title: 'Message',
        description: 'Message format transmitted by a single ECU, identified by its CAN ID',
    });

export const dbcSchema = z
    .object({
        $schema: z.string().optional(),
        id: z.string(),
        version: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
        name: z.string(),
        description: z.string(),
        messages: z.array(message),
    })
    .meta({
        id: 'dbc',
        title: 'DBC',
        description: 'Top-level DBC declaration',
    });

export type DBC = z.infer<typeof dbcSchema>;
