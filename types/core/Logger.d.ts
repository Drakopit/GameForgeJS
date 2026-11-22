/**
 * Console logging helpers for engine startup, diagnostics and HTTP requests.
 */
export class Logger {
    static logRequest(url: any, init: {}, response: any, duration: any): void;
    static log(level: any, message: any, data: any): void;
}
