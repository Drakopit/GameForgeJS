const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const source = file => import(pathToFileURL(path.resolve('src', file)));

test('timeline crosses skipped frame boundaries, samples endpoints and fires cues once', async () => {
    const { Timeline } = await source('core/Timeline.js');
    const events = [], samples = [];
    const timeline = new Timeline({duration: 4, tracks: [{start: 1, duration: 2, sample: value => samples.push(value)}],
        cues: [{at: 0, run: () => events.push('start')}, {at: 2, run: () => events.push('beat')}, {at: 4, run: () => events.push('end')}],
        onFinish: reason => events.push(reason)});
    timeline.Play(); timeline.OnUpdate(0.5); assert.deepEqual(samples, []);
    timeline.paused = true; timeline.OnUpdate(2); assert.equal(timeline.time, 0.5);
    timeline.paused = false; timeline.OnUpdate(10); timeline.OnUpdate(1);
    assert.deepEqual(samples, [1]); assert.deepEqual(events, ['start', 'beat', 'end', 'completed']);
    assert.throws(() => timeline.OnUpdate(NaN), RangeError);
    assert.throws(() => new Timeline({duration: 1, tracks: [{start: 0.9, duration: 1, sample() {}}]}), RangeError);
});

test('skip samples parallel endpoints without unvisited dialogue; cancellation releases once', async () => {
    const { Timeline } = await source('core/Timeline.js');
    const events = [];
    const timeline = new Timeline({duration: 2, tracks: [{start: 1, duration: 1, sample: t => events.push(t)}],
        cues: [{at: 1, run: () => events.push('dialogue')}], onFinish: reason => events.push(reason)});
    timeline.Play(); timeline.Skip(); timeline.Skip(); timeline.OnDestroy();
    assert.deepEqual(events, [1, 'skipped']);
    timeline.Play(); timeline.OnDestroy(); timeline.OnDestroy();
    assert.deepEqual(events, [1, 'skipped', 'cancelled']);
});

test('render queue rejects outside geometry, preserves transformed intersections and sorts transparent depth', async () => {
    const { RenderQueue3D } = await source('3d/Render3D/Renderer/RenderQueue3D.js');
    const { Mesh, PrimitiveMesh, PerspectiveCamera, Transform3D, UnlitMaterial } = await source('3d/index.js');
    const camera = new PerspectiveCamera({position: [0, 0, 0], target: [0, 0, -1], near: 0.1, far: 50, aspect: 1});
    const mesh = (position, transparent = false, scale = [1, 1, 1]) => new Mesh({geometry: PrimitiveMesh.Cube(),
        material: new UnlitMaterial({transparent}), transform: new Transform3D({position, scale})});
    const near = mesh([0, 0, -3]), far = mesh([0, 0, -12]), outside = mesh([100, 0, -5]);
    const behind = mesh([0, 0, 4]), intersecting = mesh([5, 0, -5], false, [8, 1, 1]);
    intersecting.transform.rotation.y = 0.4;
    const glassNear = mesh([0, 0, -4], true), glassFar = mesh([0, 0, -9], true);
    const queue = new RenderQueue3D();
    assert.deepEqual(queue.Build([glassNear, outside, far, behind, glassFar, near, intersecting], camera), [near, intersecting, far, glassFar, glassNear]);
    assert.equal(queue.culled, 2);
    outside.frustumCulled = false; assert.equal(queue.Build([outside], camera).length, 1);
    const growing = mesh([100, 0, -5]); assert.equal(queue.Build([growing], camera).length, 0);
    for (let index = 0; index < growing.geometry.positions.length; index += 3) growing.geometry.positions[index] -= 100;
    growing.geometry.MarkUpdated(); assert.equal(queue.Build([growing], camera).length, 1);
});

test('vector swizzles copy reads and assign writes without aliasing canonical XYZ', async () => {
    const { Vector3D } = await source('core/Math/Vector3D.js');
    const vector = new Vector3D(1, 2, 3), planar = vector.xz;
    assert.deepEqual([planar.x, planar.y], [1, 3]); planar.x = 99; assert.equal(vector.x, 1);
    vector.xz = {x: 7, y: 9}; assert.deepEqual(vector.ToArray(), [7, 2, 9]);
    assert.deepEqual(vector.Swizzle('zyx').ToArray(), [9, 2, 7]);
    assert.deepEqual(vector.Swizzle('xx').ToArray(), [7, 7]); assert.throws(() => vector.Swizzle('xw'), RangeError);
});

test('2D camera zoom preserves viewport dimensions and centres in visible world units', async () => {
    const { Camera } = await source('2d/Camera/Camera.js');
    const { Vector2D } = await source('core/Math/Vector2D.js');
    const camera = new Camera(new Vector2D(), new Vector2D(800, 600));
    camera.ZoomIn(2); camera.LookAt({position: new Vector2D(500, 400)});
    assert.deepEqual(camera.position.ToArray(), [300, 250]); assert.deepEqual(camera.size.ToArray(), [800, 600]);
    camera.ZoomOut(2); assert.equal(camera.zoom, 1); assert.throws(() => camera.SetZoom(0), RangeError);
});

test('world-map unlocks derive from completed outgoing routes and cannot bypass a locked node', async () => {
    const { RouteProgress } = await import(pathToFileURL(path.resolve('examples/route-atlas-2d/src/data/RouteProgress.js')));
    const { ScenarioWithAtlas } = await import(pathToFileURL(path.resolve('examples/route-atlas-2d/src/data/AtlasScene.js')));
    const data = ScenarioWithAtlas(require('../examples/route-atlas-2d/config/scenario.json'), require('../examples/route-atlas-2d/config/scenes/atlas.gfscene.json')), graph = new RouteProgress(data);
    graph.Clear('summit'); assert.equal(graph.cleared.size, 0); assert.deepEqual(graph.Neighbors('harbor'), []);
    graph.Clear('harbor'); assert.deepEqual(graph.Neighbors('harbor'), ['grove']);
    graph.Clear('grove'); assert(graph.Available('ridge') && graph.Available('marsh')); assert(!graph.Available('gate'));
    graph.Clear('marsh'); assert(graph.Available('gate')); graph.Reset(); assert.equal(graph.cleared.size, 0);
});

test('virtual stick keeps finger ownership, ignores a second finger and releases on interruption', async () => {
    const { VirtualStick } = await source('2d/UI/VirtualStick.js');
    const { Input } = await source('core/Input/Input.js');
    const { Vector2D } = await source('core/Math/Vector2D.js');
    const screen = {Canvas: {width: 400, height: 800, getBoundingClientRect: () => ({left: 0, top: 0, width: 400, height: 800})}};
    const previous = Input.instance;
    let starts = [], contacts = new Map();
    Input.instance = {touch: {GetStartedTouches: () => starts, GetTouch: id => contacts.get(id)}};
    try {
        const stick = new VirtualStick(screen); stick.origin.Set(70, 700);
        const contact = {identifier: 1, startPosition: new Vector2D(70, 700), position: new Vector2D(118, 700)};
        starts = [contact]; contacts.set(1, contact); stick.Update();
        assert.equal(stick.identifier, 1); assert.equal(stick.direction.x, 1);
        const other = {identifier: 2, startPosition: new Vector2D(70, 700), position: new Vector2D(22, 700)};
        starts = [other]; contacts.set(2, other); stick.Update(); assert.equal(stick.direction.x, 1);
        starts = []; contacts.delete(1); stick.Update(); assert.equal(stick.identifier, null); assert.equal(stick.direction.Length(), 0);
        assert.throws(() => new VirtualStick(screen, {radius: Infinity}), RangeError);
    } finally {Input.instance = previous;}
});
