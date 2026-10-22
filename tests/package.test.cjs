const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createProject, addModule } = require('../cli/lib/project.cjs');
const { planBuild, build } = require('../cli/lib/build.cjs');
const { PACKAGE_FILE, selectRuntime } = require('../cli/lib/package.cjs');

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-package-'));
    t.after(() => {
        assert.equal(path.dirname(root), fs.realpathSync(os.tmpdir()));
        assert.ok(path.basename(root).startsWith('gameforge-package-'));
        fs.rmSync(root, { recursive: true, force: true });
    });
    return root;
}

test('selective publication keeps framework classes and omits unselected groups', t => {
    const root = fixture(t);
    createProject(root);
    const plan = planBuild(root);
    assert.deepEqual(plan.runtimeModules, ['2d', 'core']);
    const names = plan.files.map(file => file.relative);
    assert.ok(names.includes('@engine/2d/Window/Screen.js'));
    assert.ok(names.includes('@engine/2d/Objects/GameObject.js'));
    assert.ok(names.includes('@engine/core/Bootstrap.js'));
    assert.equal(names.some(name => /^@engine\/(3d|network|compat)\//.test(name)), false);
    const html = plan.files.find(file => file.relative === 'index.html').content;
    assert.equal(html.includes('gameforgejs/3d'), false);
    assert.equal(fs.existsSync(plan.output), false);
    addModule(root, 'network');
    assert.ok(planBuild(root).runtimeModules.includes('network'));
    fs.unlinkSync(path.join(root, "config", PACKAGE_FILE));
    assert.ok(planBuild(root).files.some(file => file.relative === '@engine/3d/index.js'));
});

test('missing declarations and unsupported schemas fail before replacing a build', t => {
    const root = fixture(t);
    createProject(root);
    build(root);
    const entry = path.join(root, 'dist/main.js');
    const before = fs.readFileSync(entry, 'utf8');
    const source = path.join(root, 'main.js');
    for (const statement of [
        "import { NetworkClient } from 'gameforgejs/network';",
        "export * from 'gameforgejs/network';",
        "import('gameforgejs/network');",
        "import('./@engine/network/index.js');",
        "import(variable);",
    ]) {
        fs.writeFileSync(source, statement);
        assert.throws(() => build(root), /requires 'network'|computed import/);
        assert.equal(fs.readFileSync(entry, 'utf8'), before);
    }
    fs.writeFileSync(path.join(root, "config", PACKAGE_FILE), JSON.stringify({ schemaVersion: 2, modules: ['core'] }));
    assert.throws(() => planBuild(root), /schemaVersion/);
    fs.writeFileSync(path.join(root, "config", PACKAGE_FILE), JSON.stringify({ schemaVersion: 1, modules: ['../core'] }));
    assert.throws(() => planBuild(root), /unique modules/);
});

test('runtime dependency closure follows imports rather than a hardcoded group graph', t => {
    const root = fixture(t);
    for (const group of ['core', '2d', '3d']) fs.mkdirSync(path.join(root, group));
    fs.writeFileSync(path.join(root, '3d/index.js'), "export * from '../2d/index.js';");
    fs.writeFileSync(path.join(root, '2d/index.js'), "import '../core/index.js';");
    fs.writeFileSync(path.join(root, 'core/index.js'), 'export const value = 1;');
    assert.deepEqual(selectRuntime(root, { modules: ['3d'] }).modules, ['2d', '3d', 'core']);
    fs.writeFileSync(path.join(root, 'core/index.js'), "import './missing.js';");
    assert.throws(() => selectRuntime(root, { modules: ['3d'] }), /missing or invalid runtime dependency/);
});

test('inline imports and aliases cannot silently reach excluded runtime groups', t => {
    const root = fixture(t);
    createProject(root);
    const html = path.join(root, 'index.html');
    const original = fs.readFileSync(html, 'utf8');
    fs.writeFileSync(html, original + '<script type="module">import "gameforgejs/network";</script>');
    assert.throws(() => planBuild(root), /requires 'network'/);
    fs.writeFileSync(html, original + '<script type="module" src="./@engine/network/index.js"></script>');
    assert.throws(() => planBuild(root), /requires 'network'/);
    fs.writeFileSync(html, original.replace('"imports": {', '"imports": { "net": "./@engine/network/index.js",'));
    fs.writeFileSync(path.join(root, 'main.js'), 'import "net";');
    assert.throws(() => planBuild(root), /requires 'network'/);
});
