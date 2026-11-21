/** Canonical defaults. Config.Defaults() returns a fresh mutable copy for each game. */
export const CONFIG_DEFAULTS = Object.freeze({
    project: Object.freeze({ name: "GameForgeJS", version: "1.0.0", author: "" }),
    window: Object.freeze({ title: "GameForgeJS", backgroundColor: "#000000", resizable: true, cursor: "default" }),
    screen: Object.freeze({ width: 640, height: 480, fullScreen: false, pixelArt: true, antialiasing: false, orientation: "landscape" }),
    physics: Object.freeze({ enabled: true, gravity: Object.freeze({ x: 0, y: 9.8 }), debug: false }),
    network: Object.freeze({ serverUrl: "ws://localhost:3000", autoConnect: false, syncRate: 60 }),
    audio: Object.freeze({ masterVolume: 0.8, muteOnFocusLoss: true }),
    assets: Object.freeze({ basePath: "./assets/", preload: Object.freeze([]) }),
    debug: Object.freeze({ showFPS: false, showHitboxes: false, admin: false, logLevel: "info" }),
});
