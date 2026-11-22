/** Optional Canvas 2D renderer and overlay factory, owned by one game. */
export function module2D({ contextAttributes, telemetry }?: {
    contextAttributes?: {};
    telemetry?: boolean;
}): {
    id: string;
    setup(context: any): void;
};
