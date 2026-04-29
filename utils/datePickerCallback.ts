let _callback: ((date: string) => void) | null = null;

export const datePickerCallback = {
    set: (cb: (date: string) => void) => {
        _callback = cb;
    },
    call: (date: string) => {
        _callback?.(date);
        _callback = null;
    },
};
