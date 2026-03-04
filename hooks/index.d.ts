// hooks/index.d.ts

/**
 * @version 0.0.1
 * @returns Returns a stateful value, a function to update it, a function to free it, and a loading value
 */
export declare function useStore<S>(
    keyValue: string,
    initialValue: S,
): readonly [S, (newVal: S) => void, () => void, boolean];
