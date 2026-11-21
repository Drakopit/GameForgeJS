const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createProject, loadProject } = require('../cli/lib/project.cjs');
const { planBuild } = require('../cli/lib/build.cjs');

test('config folder and old root manifests work, but duplicate declarations fail', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-config-'));
    t.after(() => {
        assert.equal(path.dirname(root), fs.realpathSync(os.tmpdir()));
        assert.ok(path.basename(root).startsWith('gameforge-config-'));
        fs.rmSync(root, { recursive: true, force: true });
    });
    createProject(root);
    assert.equal(loadProject(root).runtimeConfig, 'config/game.config.json');
    const plan = planBuild(root);
    assert.ok(plan.files.some(file => file.relative === 'config/game.config.json'));
    assert.ok(plan.files.some(file => file.relative === 'config/resources.json'));
    assert.equal(plan.files.some(file => /gameforge(js\.package|\.project)\.json$/.test(file.relative)), false);
    const filename = 'gameforge.project.json';
    fs.copyFileSync(path.join(root, 'config', filename), path.join(root, filename));
    assert.throws(() => loadProject(root), /Ambiguous configuration/);
    fs.unlinkSync(path.join(root, 'config', filename));
    assert.equal(loadProject(root).resources, 'config/resources.json');
    assert.deepEqual(planBuild(root).runtimeModules, ['2d', 'core']);
    const distribution = 'gameforgejs.package.json';
    fs.copyFileSync(path.join(root, 'config', distribution), path.join(root, distribution));
    assert.throws(() => planBuild(root), /Ambiguous configuration/);
});
