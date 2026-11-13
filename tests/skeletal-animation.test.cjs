const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const source = file => import(pathToFileURL(path.resolve('src', file)).href);

async function fixture() {
    const { Geometry3D, Mesh, Model3D, SkeletalAnimator } = await source('3d/index.js');
    const nodes = [0, 1].map(index => ({
        index, name: `node${index}`, children: index === 0 ? [1] : [],
        translation: [0, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1], matrix: null,
    }));
    const part = { node: nodes[0], skin: { joints: [1], inverseBindMatrices: null }, joints: [0, 0, 0, 0], weights: [1, 0, 0, 0] };
    const asset = { nodes, animations: [{ name: 'slide', channels: [{ target: { node: 1, path: 'translation' }, sampler: 0 }], samplers: [{ interpolation: 'LINEAR', input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 2, 0, 0]) }] }] };
    const positions = new Float32Array([1, 0, 0]);
    function create() {
        const mesh = new Mesh({ geometry: new Geometry3D({ positions, normals: [0, 1, 0] }) });
        mesh.modelPart = part;
        const model = new Model3D([mesh]);
        model.sourceAsset = asset;
        return { animator: new SkeletalAnimator(model).AddClip('slide'), mesh };
    }
    return { create, asset, positions, part };
}

test('skeletal playback deforms instance-local geometry, loops and holds non-looping endpoints', async () => {
    const { create, positions } = await fixture();
    const a = create(), b = create();
    a.animator.Play('slide', { loop: false });
    a.animator.Update(0.5);
    assert.equal(a.mesh.geometry.positions[0], 2);
    assert.equal(b.mesh.geometry.positions[0], 1);
    assert.equal(positions[0], 1);
    assert.ok(a.mesh.geometry.version > 0);
    a.animator.Update(1);
    assert.equal(a.mesh.geometry.positions[0], 3);
    assert.equal(a.animator.finished, true);
    a.animator.Play('slide', { loop: true, restart: true });
    a.animator.Update(1.25);
    assert.equal(a.mesh.geometry.positions[0], 1.5);
    a.animator.Play('slide');
    assert.equal(a.animator.time, 0.25, 'Repeated selection restarted animation');
});

test('skeletal binding rejects incompatible rigs, unsupported tracks and malformed timelines', async () => {
    const { create, asset } = await fixture();
    const { animator } = create();
    const invalid = structuredClone(asset);
    invalid.nodes[1].translation[0] = 1;
    assert.throws(() => animator.AddClip('bad', invalid, 'slide'), /rest pose/);
    invalid.nodes[1].translation[0] = 0;
    invalid.animations[0].samplers[0].interpolation = 'CUBICSPLINE';
    assert.throws(() => animator.AddClip('bad', invalid, 'slide'), /sampler/);
    invalid.animations[0].samplers[0].interpolation = 'LINEAR';
    invalid.animations[0].samplers[0].input[1] = 0;
    assert.throws(() => animator.AddClip('bad', invalid, 'slide'), /keyframe times/);
    assert.throws(() => animator.Play('missing'), /not registered/);
    assert.throws(() => animator.Update(-1), /nonnegative/);
});

test('quaternion sampling follows shortest rotation and STEP preserves previous key', async () => {
    const { SampleTrack } = await source('3d/Animation/ClipSampler.js');
    const sampler = { interpolation: 'LINEAR', input: [0, 1], output: [0, 0, 0, 1, 0, 0, 1, 0] };
    const q = SampleTrack(sampler, 'rotation', 0.5);
    assert.ok(Math.abs(q[2] - Math.SQRT1_2) < 1e-6);
    assert.ok(Math.abs(q[3] - Math.SQRT1_2) < 1e-6);
    sampler.output = [0, 0, 0, 1, 0, 0, 0, -1];
    assert.deepEqual(SampleTrack(sampler, 'rotation', 0.5), [0, 0, 0, 1]);
    sampler.interpolation = 'STEP';
    assert.deepEqual(SampleTrack(sampler, 'rotation', 0.9), [0, 0, 0, 1]);
});

test('inverse bind matrices preserve rest shape before applying joint motion', async () => {
    const { create, asset, part } = await fixture();
    asset.nodes[1].translation = [2, 0, 0];
    part.skin.inverseBindMatrices = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -2, 0, 0, 1]);
    asset.animations[0].samplers[0].output = new Float32Array([2, 0, 0, 4, 0, 0]);
    const { animator, mesh } = create();
    assert.equal(mesh.geometry.positions[0], 1);
    animator.Play('slide', { loop: false });
    animator.Seek(0.5);
    assert.equal(mesh.geometry.positions[0], 2);
    assert.deepEqual(Array.from(mesh.geometry.normals), [0, 1, 0]);
});
