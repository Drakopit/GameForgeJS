const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const source = () => import(pathToFileURL(path.resolve('src/core/index.js')));
const point = (identifier, x, y) => ({ identifier, clientX: x, clientY: y });
function fire(target, type, points) {
    const event = new Event(type);
    Object.defineProperty(event, 'changedTouches', { value: points });
    target.dispatchEvent(event);
}

test('Touch tracks independent fingers and frame edges without exposing mutable internal contacts', async () => {
    const { Touch } = await source();
    const target = new EventTarget();
    const touch = new Touch({ shared: false, target });
    fire(target, 'touchstart', [point(7, 10, 20), point(19, 50, 60)]);
    fire(target, 'touchmove', [point(7, 30, 40)]);
    touch.Update();
    assert.deepEqual(touch.GetActiveTouches().map(contact => contact.identifier), [7, 19]);
    assert.deepEqual(touch.GetTouch(7).startPosition.ToArray(), [10, 20]);
    assert.deepEqual(touch.GetTouch(7).position.ToArray(), [30, 40]);
    assert.deepEqual(touch.GetTouch(19).position.ToArray(), [50, 60]);
    const snapshot = touch.GetTouch(7); snapshot.position.x = -100;
    assert.equal(touch.GetTouch(7).position.x, 30);
    assert.equal(touch.GetStartedTouches().length, 2);
    touch.ClearFrameData(); touch.Update();
    assert.equal(touch.GetStartedTouches().length, 0);
    fire(target, 'touchend', [point(19, 52, 63)]);
    touch.Update();
    assert.equal(touch.GetTouch(19), null);
    assert.equal(touch.GetTouch(7).identifier, 7);
    assert.equal(touch.GetEndedTouches()[0].cancelled, false);
    assert.deepEqual(touch.getTouchEndPosition().ToArray(), [52, 63]);
    touch.Dispose();
});

test('Touch cancels on interruption, preserves quick taps and unregisters handlers on disposal', async () => {
    const { Touch } = await source();
    const target = new EventTarget();
    const touch = new Touch({ shared: false, target });
    fire(target, 'touchstart', [point(1, 5, 6)]);
    fire(target, 'touchend', [point(1, 5, 6)]);
    touch.Update();
    assert.equal(touch.GetStartedTouches().length, 1);
    assert.equal(touch.GetEndedTouches().length, 1);
    for (const interruption of ['touchcancel', 'blur', 'resize']) {
        fire(target, 'touchstart', [point(2, 10, 10)]);
        if (interruption === 'touchcancel') fire(target, interruption, [point(2, 10, 10)]);
        else target.dispatchEvent(new Event(interruption));
        touch.Update();
        assert.equal(touch.GetActiveTouches().length, 0);
        assert.ok(touch.GetEndedTouches().some(contact => contact.cancelled));
    }
    touch.Dispose(); touch.Dispose();
    fire(target, 'touchstart', [point(3, 20, 20)]);
    assert.equal(touch.GetActiveTouches().length, 0);
});

test('Touch.ToScreen accounts for CSS scale and letterbox offsets', async () => {
    const { Touch, Vector2D } = await source();
    const screen = { Canvas: { width: 480, height: 800, getBoundingClientRect: () => ({ left: 100, top: 50, width: 240, height: 400 }) } };
    assert.deepEqual(Touch.ToScreen(new Vector2D(160, 150), screen).ToArray(), [120, 200]);
    screen.Canvas.getBoundingClientRect = () => ({ width: 0, height: 0 });
    assert.throws(() => Touch.ToScreen(new Vector2D(), screen), /visible screen/);
});
