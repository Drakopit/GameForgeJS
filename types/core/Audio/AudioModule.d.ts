/** Optional, per-game Web Audio service and asset decoding. */
export function audioModule({ initialize }?: {
    initialize?: boolean;
}): {
    id: string;
    setup(context: any): void;
};
