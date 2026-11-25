/** Canonical defaults. Config.Defaults() returns a fresh mutable copy for each game. */
export const CONFIG_DEFAULTS: Readonly<{
    project: Readonly<{
        name: "GameForgeJS";
        version: "1.0.0";
        author: "";
    }>;
    window: Readonly<{
        title: "GameForgeJS";
        backgroundColor: "#000000";
        resizable: true;
        cursor: "default";
    }>;
    screen: Readonly<{
        width: 640;
        height: 480;
        fullScreen: false;
        pixelArt: true;
        antialiasing: false;
        orientation: "landscape";
    }>;
    physics: Readonly<{
        enabled: true;
        gravity: Readonly<{
            x: 0;
            y: 9.8;
        }>;
        debug: false;
    }>;
    network: Readonly<{
        serverUrl: "ws://localhost:3000";
        autoConnect: false;
        syncRate: 60;
    }>;
    audio: Readonly<{
        masterVolume: 0.8;
        muteOnFocusLoss: true;
    }>;
    assets: Readonly<{
        basePath: "./assets/";
        preload: readonly any[];
    }>;
    debug: Readonly<{
        showFPS: false;
        showHitboxes: false;
        admin: false;
        logLevel: "info";
        stats: false;
        statsKey: "F3";
    }>;
}>;
