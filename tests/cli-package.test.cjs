const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { createProject } = require('../cli/lib/project.cjs');

test('npm pack installs offline and the installed CLI builds an independent project', { timeout: 120000 }, t => {
    const npmCli = [process.env.npm_execpath,
        path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
        path.join(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    ].find(file => file && fs.existsSync(file));
    if (!npmCli) { t.skip('npm CLI was not found beside Node; run through npm test to provide npm_execpath.'); return; }
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'gameforge-cli-pack-'));
    t.after(() => {
        assert.equal(path.dirname(temporary), fs.realpathSync(os.tmpdir()));
        assert.ok(path.basename(temporary).startsWith('gameforge-cli-pack-'));
        fs.rmSync(temporary, { recursive: true, force: true });
    });
    const engine = path.resolve(__dirname, '..');
    const command = (script, args, cwd) => {
        const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', timeout: 90000 });
        assert.equal(result.status, 0, `${result.error || ''}\n${result.stderr}\n${result.stdout}`);
        return result.stdout;
    };
    const packed = JSON.parse(command(npmCli, ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary], engine));
    const archive = path.join(temporary, packed[0].filename);
    const root = path.join(temporary, 'independent-game');
    createProject(root, { template: 'minimal-3d' });
    command(npmCli, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', archive], root);
    const manifestFile = path.join(root, 'config/gameforge.project.json');
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    manifest.enginePath = './nonexistent-development-checkout';
    fs.writeFileSync(manifestFile, JSON.stringify(manifest));
    const installed = path.join(root, 'node_modules/gameforgejs');
    const cli = path.join(installed, 'cli/index.cjs');
    const diagnostic = JSON.parse(command(cli, ['doctor'], root));
    assert.equal(diagnostic.engine, installed);
    command(cli, ['build'], root);
    assert.ok(fs.existsSync(path.join(root, 'dist/@engine/core/index.js')));
    assert.match(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8'), /\.\/@engine\/3d\/index\.js/);
    assert.ok(fs.existsSync(path.join(installed, 'cli/templates/minimal-2d/main.js')));
    assert.equal(fs.existsSync(path.join(installed, 'examples')), false);
});
