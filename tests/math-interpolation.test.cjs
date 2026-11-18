const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const core = () => import(pathToFileURL(path.resolve('src/core/index.js')));

test('angle interpolation crosses the wrap along the short arc and clamps endpoints', async () => {
    const { MathExt } = await core();
    const degrees = Math.PI / 180;
    const actual = MathExt.LerpAngle(170 * degrees, -170 * degrees, 0.5);
    assert.ok(Math.abs(actual - Math.PI) < 1e-12);
    assert.equal(MathExt.LerpAngle(1, 2, -1), 1);
    assert.equal(MathExt.LerpAngle(1, 2, 2), 2);
    assert.ok(Math.abs(MathExt.LerpAngle(-170 * degrees, 170 * degrees, 0.5) + Math.PI) < 1e-12);
});

test('vector interpolation clamps t and does not alias or mutate endpoint vectors', async () => {
    const { Vector3D } = await core();
    const start = new Vector3D(-2, 4, 10);
    const end = new Vector3D(6, -4, 2);
    const middle = Vector3D.Lerp(start, end, 0.5);
    assert.deepEqual(middle.ToArray(), [2, 0, 6]);
    assert.deepEqual(Vector3D.Lerp(start, end, -1).ToArray(), start.ToArray());
    assert.deepEqual(Vector3D.Lerp(start, end, 2).ToArray(), end.ToArray());
    middle.x = 99;
    assert.equal(start.x, -2);
    assert.equal(end.x, 6);
    assert.notEqual(Vector3D.Lerp(start, end, 0), start);
});
