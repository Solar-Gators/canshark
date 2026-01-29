import { z } from 'zod';

/**
 * Provides a flexible int transformation function for a flexible int
 * @param {number} base the base to decode the string with
 * @param {number} [suffix] the length of the base suffix (to exclude)
 * @returns a Zod transform function for a flexible int
 */
export const transformFlexibleInt =
    (base: number, suffix: number = 1) =>
        (v: string, ctx: z.core.$RefinementCtx<string>): number | typeof z.NEVER => {
            if (suffix) v = v.slice(0, suffix);

            try {
                return Number.parseInt(v, base);
            } catch {
                ctx.addIssue({
                    code: 'custom',
                    message: `Not a base ${String(base)} number`,
                    input: v,
                });

                return z.NEVER;
            }
        };
