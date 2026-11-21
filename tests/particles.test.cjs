const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const source = file => import(pathToFileURL(path.resolve('src', file)));
test('particle motion and lifetime use seconds, with visible linear size/color curves', async () => {
    const { Particle } = await source('2d/Particle/Particle.js');
    const options = { vx: 60, vy: -30, lifetime: 2, size: 4, endSize: 0,
        color: { r: 255, g: 0, b: 0 }, endColor: { r: 0, g: 0, b: 255 } };
    const a = new Particle(0, 100, options), b = new Particle(0, 100, options);
    for (let i = 0; i < 60; i++)
        a.OnUpdate(1 / 60);
    for (let i = 0; i < 120; i++)
        b.OnUpdate(1 / 120);
    assert(Math.abs(a.position.x - 60) < 1e-9);
    assert(Math.abs(a.position.y - b.position.y) < 1e-9);
    let radius;
    const context = { beginPath() { }, arc(x, y, r) { radius = r; }, fill() { } };
    a.Draw(context);
    assert(Math.abs(radius - 2) < 1e-9);
    assert(Math.abs(context.globalAlpha - 0.5) < 1e-9);
    assert.match(context.fillStyle, /^rgb\(12[78],0,12[78]\)$/);
    a.OnUpdate(1.01);
    assert.equal(a.isAlive(), false);
    assert.throws(() => b.OnUpdate(-1), RangeError);
    assert.throws(() => b.Reset(0, 0, { lifetime: 0 }), RangeError);
});
test('particle component caps emissions, reuses identities and cleans every lease on disposal', async () => {
    const { ParticleSystem } = await source('2d/Particle/ParticleSystem.js');
    const system = new ParticleSystem({ capacity: 3 });
    const identities = new Set(system.pool.pool);
    for (let run = 0; run < 100; run++) {
        for (let i = 0; i < 3; i++)
            assert(identities.has(system.Emit(i, 0, { lifetime: 0.01 })));
        assert.equal(system.Emit(0, 0), null);
        system.OnUpdate(0.02);
        assert.equal(system.particles.length, 0);
        assert.equal(system.pool.pool.length, 3);
    }
    assert.equal(system.dropped, 100);
    system.Clear();
    assert.equal(system.dropped, 0);
    assert.throws(() => system.OnUpdate(NaN), RangeError);
    system.Emit(0, 0);
    system.OnDestroy();
    assert.equal(system.particles.length, 0);
    assert.equal(system.pool.pool.length, 0);
    assert.equal(system.onStep, null);
});
test('bounded pooling is opt-in; existing unbounded pools can still grow', async () => {
    const { ObjectPool } = await source('core/ObjectPool.js');
    const classic = new ObjectPool(() => ({ active: false }), 1);
    classic.Get();
    classic.Get();
    assert.equal(classic.pool.length, 2);
    const limited = new ObjectPool(() => ({ active: false }), 1, { maxSize: 1 });
    const object = limited.Get();
    assert.equal(limited.Get(), null);
    limited.Release(object);
    assert.equal(limited.Get(), object);
    assert.throws(() => new ObjectPool(() => ({}), 2, { maxSize: 1 }), RangeError);
});
test('render targets reuse dimensions and release backing storage without creating visible canvases', async () => {
    const previous = global.OffscreenCanvas;
    let clears = 0;
    global.OffscreenCanvas = class {
        constructor(w, h) { this.width = w; this.height = h; }
        getContext() { return { clearRect() { clears++; } }; }
    };
    try {
        const { CanvasRenderTarget } = await source('2d/Graphics/CanvasRenderTarget.js');
        const target = new CanvasRenderTarget(320, 180), canvas = target.Canvas;
        target.Resize(320, 180);
        target.Clear();
        assert.equal(target.Canvas, canvas);
        assert.equal(clears, 1);
        assert.throws(() => target.Resize(0, 20), RangeError);
        target.Dispose();
        assert.equal(canvas.width, 0);
        assert.equal(canvas.height, 0);
    }
    finally {
        if (previous === undefined)
            delete global.OffscreenCanvas;
        else
            global.OffscreenCanvas = previous;
    }
});
test('Canvas sliders clamp and quantize values without owning a device or a listener', async () => {
    const { Slider } = await source('2d/UI/Slider.js');
    let emitted;
    const slider = new Slider({ Canvas: {} }, { min: -10, max: 10, step: 2, onChange: value => { emitted = value; } });
    slider.SetValue(99);
    assert.equal(slider.value, 10);
    assert.equal(emitted, 10);
    slider.Adjust(-1);
    assert.equal(slider.value, 8);
    slider.rect = { x: 10, y: 20, width: 100, height: 44 };
    slider.SetFromPoint(35);
    assert.equal(slider.value, -4);
    slider.Cancel();
    assert.equal(slider.finger, null);
    assert.throws(() => new Slider({ Canvas: {} }, { min: 1, max: 0 }), RangeError);
});
