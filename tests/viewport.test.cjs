const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

test('viewport binding follows visible area and safe insets, then releases all resize listeners', async () => {
    const { GameViewport } = await import(pathToFileURL(path.resolve('src/core/Window/GameViewport.js')));
    const previous = { window: global.window, document: global.document, getComputedStyle: global.getComputedStyle };
    const viewport = Object.assign(new EventTarget(), { width: 390, height: 700, offsetLeft: 0, offsetTop: 0 });
    const style = { setProperty(name, value) { this[name] = value; } };
    const screen = {
        Canvas: { width: 960, height: 600, style }, Context: {}, config: { screen: { pixelArt: true } },
        Resize(size) { this.Canvas.width = size.x; this.Canvas.height = size.y; },
    };
    let notifications = 0;
    try {
        global.window = Object.assign(new EventTarget(), { innerWidth: 390, innerHeight: 844, visualViewport: viewport });
        global.document = { body: { style: {} } };
        global.getComputedStyle = () => ({ getPropertyValue: name => style[name]?.startsWith('env(') ? '0px' : style[name] });
        const detach = GameViewport.Bind(screen, { onResize: () => notifications++ });
        assert.equal(screen.Canvas.height, 700);
        assert.equal(style.position, 'fixed');
        assert.equal(screen.Context.imageSmoothingEnabled, false);
        style.setProperty('--gameforge-safe-bottom', '34px');
        viewport.height = 300; viewport.offsetTop = 20;
        viewport.dispatchEvent(new Event('resize'));
        assert.equal(screen.Canvas.height, 266);
        assert.equal(style.top, '20px'); assert.equal(style.height, '266px');
        assert.equal(notifications, 2);
        detach();
        viewport.height = 200;
        viewport.dispatchEvent(new Event('resize')); viewport.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        assert.equal(screen.Canvas.height, 266); assert.equal(notifications, 2);
        assert.throws(() => GameViewport.Bind(screen, { minWidth: Infinity, maxWidth: Infinity }), RangeError);
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete global[key]; else global[key] = value;
        }
    }
});
