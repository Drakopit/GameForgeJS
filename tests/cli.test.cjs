const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const { createProject, addModule, generate, update, doctor, engineRootFor, modulesSource } = require('../cli/lib/project.cjs');
const { build, planBuild } = require('../cli/lib/build.cjs');
const { startServer } = require('../cli/server.cjs');
const { parseArgs } = require('../cli/index.cjs');

const ENGINE = path.resolve(__dirname, '..');
function fixture(t) {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-cli-test-'));
    t.after(() => {
        assert.equal(path.dirname(temporary), fs.realpathSync(os.tmpdir()));
        assert.ok(path.basename(temporary).startsWith('gameforge-cli-test-'));
        fs.rmSync(temporary, { recursive: true, force: true });
    });
    return temporary;
}
const read = file => fs.readFileSync(file, 'utf8');
const project = root => JSON.parse(read(path.join(root, 'config/gameforge.project.json')));
const request = (server, route, method = 'GET') => new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: server.address().port, path: route, method }, response => {
        const parts = [];
        response.on('data', part => parts.push(part));
        response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(parts).toString() }));
    });
    req.on('error', reject); req.end();
});

test('create is offline, supports dry-run, and refuses populated directories', t => {
    const temporary = fixture(t);
    const root = path.join(temporary, 'my-game');
    const plan = createProject(root, { dryRun: true });
    assert.ok(plan.files.includes('index.html'));
    assert.equal(fs.existsSync(root), false);
    createProject(root);
    assert.equal(doctor(root).modules[0], '2d');
    assert.ok(read(path.join(root, 'index.html')).includes('gameforgejs/core'));
    assert.match(read(path.join(root, 'main.js')), /BootstrapGame/);
    assert.match(read(path.join(root, 'src/levels/FirstLevel.js')), /extends Level/);
    assert.match(read(path.join(root, 'src/entities/Player.js')), /extends GameObject/);
    assert.equal(fs.existsSync(path.join(root, '@engine')), false);
    assert.equal(fs.existsSync(path.join(root, 'node_modules')), false);
    assert.throws(() => createProject(root), /empty/);
    assert.equal(project(root).schemaVersion, 1);
});

test('add is idempotent and validates all conflicts before writing', t => {
    const root = path.join(fixture(t), 'my-game');
    createProject(root);
    const before = read(path.join(root, 'config/gameforge.project.json'));
    assert.equal(addModule(root, 'network', { dryRun: true }).files.length, 3);
    assert.equal(read(path.join(root, 'config/gameforge.project.json')), before);
    addModule(root, 'network');
    assert.deepEqual(project(root).modules, ['2d', 'network']);
    assert.deepEqual(addModule(root, 'network').files, []);
    assert.throws(() => addModule(root, 'untrusted-url'), /official module/);
    assert.throws(() => addModule(root, '__proto__'), /official module/);
    const after = read(path.join(root, 'config/gameforge.project.json'));
    fs.appendFileSync(path.join(root, 'src/modules.js'), '\n// User customization\n');
    assert.throws(() => addModule(root, 'audio'), /Conflict/);
    assert.equal(read(path.join(root, 'config/gameforge.project.json')), after);
});

test('generate rejects traversal and protects existing authored content', t => {
    const root = path.join(fixture(t), 'my-game');
    createProject(root);
    assert.throws(() => generate(root, 'level', '../../Outside'), /identifier/);
    generate(root, 'level', 'GeneratedLevel', { dryRun: true });
    const file = path.join(root, 'src/levels/GeneratedLevel.js');
    assert.equal(fs.existsSync(file), false);
    generate(root, 'level', 'GeneratedLevel');
    assert.match(read(file), /OnGUI/);
    assert.deepEqual(generate(root, 'level', 'GeneratedLevel').files, []);
    fs.appendFileSync(file, '\n// authored\n');
    assert.throws(() => generate(root, 'level', 'GeneratedLevel'), /Conflict/);
});

test('generated scaffolds follow the selected project inheritance pattern', t => {
    const root2d = path.join(fixture(t), 'my-2d-game');
    createProject(root2d);
    generate(root2d, 'level', 'ForestLevel');
    generate(root2d, 'screen', 'ForestScreen');
    generate(root2d, 'entity', 'ForestPlayer');
    assert.match(read(path.join(root2d, 'src/levels/ForestLevel.js')), /extends Level/);
    assert.match(read(path.join(root2d, 'src/screens/ForestScreen.js')), /extends Level/);
    assert.match(read(path.join(root2d, 'src/entities/ForestPlayer.js')), /extends GameObject/);

    const root3d = path.join(fixture(t), 'my-3d-game');
    createProject(root3d, { template: 'minimal-3d' });
    generate(root3d, 'level', 'ForestLevel');
    generate(root3d, 'screen', 'ForestScreen');
    generate(root3d, 'entity', 'ForestObject');
    assert.match(read(path.join(root3d, 'main.js')), /BootstrapGame/);
    assert.match(read(path.join(root3d, 'src/levels/ForestLevel.js')), /extends Level3D/);
    assert.match(read(path.join(root3d, 'src/levels/ForestLevel.js')), /BuildScene\(\)/);
    assert.match(read(path.join(root3d, 'src/screens/ForestScreen.js')), /extends Level3D/);
    assert.match(read(path.join(root3d, 'src/entities/ForestObject.js')), /extends Base/);
});

test('update migrates only known schemas, preserves custom keys and is idempotent', t => {
    const root = path.join(fixture(t), 'my-game');
    createProject(root);
    const file = path.join(root, 'config/gameforge.project.json');
    const old = { ...project(root), schemaVersion: 0, custom: { keep: true } };
    delete old.resources;
    fs.writeFileSync(file, JSON.stringify(old));
    update(root, { to: '1', dryRun: true });
    assert.equal(project(root).schemaVersion, 0);
    update(root, { to: '1' });
    assert.deepEqual(project(root).custom, { keep: true });
    assert.equal(project(root).resources, 'resources.json');
    assert.deepEqual(update(root).files, []);
    assert.throws(() => update(root, { to: '99' }), /Only project schema/);
    fs.writeFileSync(file, JSON.stringify({ ...project(root), schemaVersion: 99 }));
    assert.throws(() => update(root), /No migration/);
});

test('build plans reject dangerous output before any source is changed', t => {
    const temporary = fixture(t);
    const root = path.join(temporary, 'my-game');
    createProject(root);
    const source = read(path.join(root, 'main.js'));
    for (const output of ['.', '..', 'src', 'src/output', 'assets', 'assets/output', 'config', 'config/output']) {
        assert.throws(() => planBuild(root, { output }), /project directory|source directory/);
        assert.equal(read(path.join(root, 'main.js')), source);
    }
    const unrelated = path.join(temporary, 'important');
    fs.mkdirSync(unrelated); fs.writeFileSync(path.join(unrelated, 'keep.txt'), 'keep');
    assert.throws(() => planBuild(root, { output: unrelated }), /nonempty directory/);
    assert.equal(read(path.join(unrelated, 'keep.txt')), 'keep');
    fs.unlinkSync(path.join(root, 'config/resources.json'));
    assert.throws(() => planBuild(root), /Missing config\/resources/);
    assert.equal(fs.existsSync(path.join(root, 'dist')), false);
});

test('2D and 3D builds are portable, repeatable artifacts without editable engine copies', t => {
    const temporary = fixture(t);
    for (const template of ['minimal-2d', 'minimal-3d']) {
        const root = path.join(temporary, template);
        createProject(root, { template });
        const plan = planBuild(root);
        assert.equal(fs.existsSync(plan.output), false);
        build(root, { dryRun: true });
        assert.equal(fs.existsSync(plan.output), false);
        build(root);
        assert.ok(fs.existsSync(path.join(plan.output, '@engine/core/index.js')));
        assert.equal(fs.existsSync(path.join(plan.output, '@engine/3d/index.js')), template === 'minimal-3d');
        assert.equal(fs.existsSync(path.join(root, '@engine')), false);
        assert.equal(fs.existsSync(path.join(plan.output, 'gameforge.project.json')), false);
        assert.equal(read(path.join(root, 'main.js')), read(path.join(plan.output, 'main.js')));
        const firstHTML = read(path.join(plan.output, 'index.html'));
        build(root);
        assert.equal(read(path.join(plan.output, 'index.html')), firstHTML);
        assert.match(firstHTML, /\.\/@engine\/core\/index\.js/);
    }
});

test('an installed local package takes precedence over development enginePath', t => {
    const root = path.join(fixture(t), 'my-game');
    createProject(root);
    const installed = path.join(root, 'node_modules/gameforgejs');
    fs.mkdirSync(path.join(installed, 'src/core'), { recursive: true });
    fs.writeFileSync(path.join(installed, 'src/core/index.js'), 'export {};');
    assert.equal(engineRootFor(root, project(root)), installed);
});

test('legacy publication validates missing inputs and protects project root', t => {
    const root = path.join(fixture(t), 'legacy');
    fs.mkdirSync(path.join(root, 'game'), { recursive: true });
    fs.writeFileSync(path.join(root, 'game/index.html'), '<script type="module" src="main.js"></script>');
    fs.writeFileSync(path.join(root, 'game/main.js'), 'export {};');
    const config = { gameRoot: 'game', engineRoot: '.', output: 'publish', entry: 'index.html', engineModules: [], gameFiles: ['main.js'] };
    const file = path.join(root, 'gameforge.publisher.json');
    fs.writeFileSync(file, JSON.stringify(config));
    build(root);
    assert.match(read(path.join(root, 'publish/index.html')), /\.\/game\/main\.js/);
    fs.writeFileSync(file, JSON.stringify({ ...config, output: '.' }));
    assert.throws(() => planBuild(root), /project directory/);
    fs.writeFileSync(file, JSON.stringify({ ...config, gameFiles: ['missing.js'] }));
    assert.throws(() => planBuild(root), /Missing game file/);
    assert.ok(fs.existsSync(path.join(root, 'game/main.js')));
    assert.ok(fs.existsSync(path.join(root, 'publish/index.html')));
});

test('server defaults to loopback and handles prefix hosting, malformed URLs and private files', async t => {
    const temporary = fixture(t);
    const root = path.join(temporary, 'my-game');
    createProject(root);
    fs.mkdirSync(path.join(root, '.git')); fs.writeFileSync(path.join(root, '.git/config'), 'secret');
    const server = await startServer({ root, engineRoot: ENGINE, port: 0, basePath: '/game/' });
    t.after(() => new Promise(resolve => server.close(resolve)));
    assert.equal(server.address().address, '127.0.0.1');
    assert.equal((await request(server, '/game/')).status, 200);
    assert.equal((await request(server, '/game')).status, 308);
    assert.equal((await request(server, '/')).status, 404);
    assert.equal((await request(server, '/game/%')).status, 400);
    assert.equal((await request(server, '/game/.git/config')).status, 403);
    assert.equal((await request(server, '/game/%2e%2e/outside')).status, 403);
    assert.equal((await request(server, '/game/..%5coutside')).status, 403);
    assert.equal((await request(server, '/game/', 'POST')).status, 405);
    const module = await request(server, '/game/@engine/core/index.js');
    assert.equal(module.status, 200); assert.match(module.headers['content-type'], /javascript/);
    assert.equal((await request(server, '/game/', 'HEAD')).body, '');
    assert.equal((await request(server, '/game/')).status, 200);
});

test('CLI syntax errors and failed publication produce nonzero exit status', t => {
    assert.throws(() => parseArgs(['build', '--out']), /Missing value/);
    assert.throws(() => parseArgs(['build', '--unknown']), /Unknown option/);
    const root = fixture(t);
    const result = spawnSync(process.execPath, [path.join(ENGINE, 'cli/index.cjs'), 'build', '--root', root], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing gameforge.project/);
});
