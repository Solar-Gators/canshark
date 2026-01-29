import { blue } from './yoctocolors';

export function log(label: string, ...args: unknown[]) {
    console.log(blue(`[${label}]`), ...args);
}

export default { log };
