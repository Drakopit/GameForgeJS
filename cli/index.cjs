#!/usr/bin/env node
const path = require('node:path');
const fs = require('node:fs');
const project = require('./lib/project.cjs');
const { configFile } = require('./lib/config-paths.cjs');
const { build } = require('./lib/build.cjs');

function parseArgs(args) {
    const positionals = [];
    const options = {};
    const boolean = new Set(['dry-run', 'help']);
    const valued = new Set(['root', 'template', 'engine', 'name', 'out', 'config', 'host', 'port', 'base', 'to']);
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (!arg.startsWith('--')) { positionals.push(arg); continue; }
        const name = arg.slice(2);
        if (boolean.has(name)) { options[name === 'dry-run' ? 'dryRun' : name] = true; continue; }
        if (!valued.has(name)) throw new Error(`Unknown option ${arg}`);
        if (args[index + 1] === undefined || args[index + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
        options[name === 'out' ? 'output' : name === 'base' ? 'basePath' : name] = args[++index];
    }
    return { positionals, options };
}

const HELP = `GameForgeJS local project tools
  gameforge create <directory> [--template minimal-2d|minimal-3d] [--engine <directory>]
  gameforge add <2d|3d|network|audio> [--root <project>]
  gameforge generate <level|screen|entity|module> <Name> [--root <project>]
  gameforge doctor [--root <project>]
  gameforge serve [--root <project>] [--host 127.0.0.1] [--port 8080] [--base /game/]
  gameforge build [--root <project>] [--out dist] [--config <publisher.json>]
  gameforge update [--root <project>] [--to 1]
create/add/generate/build/update support --dry-run. Updates are known local schema migrations;
no command downloads packages or executes third-party installation hooks.
`;

async function run(args = process.argv.slice(2), output = console) {
    const { positionals, options } = parseArgs(args);
    const [command, first, second] = positionals;
    if (!command || options.help || command === 'help') { output.log(HELP); return; }
    const root = path.resolve(options.root || process.cwd());
    let result;
    switch (command) {
        case 'create': if (!first) throw new Error('create requires a directory.'); result = project.createProject(path.resolve(root, first), options); break;
        case 'add': result = project.addModule(root, first, options); break;
        case 'generate': result = project.generate(root, first, second, options); break;
        case 'doctor': result = project.doctor(root, options); break;
        case 'build': result = build(root, options); break;
        case 'update': case 'migrate': result = project.update(root, options); break;
        case 'serve': {
            if (options.dryRun) throw new Error('serve does not accept --dry-run.');
            const manifest = fs.existsSync(configFile(root, project.PROJECT_FILE)) ? project.loadProject(root) : {};
            const engineRoot = fs.existsSync(path.join(root, '@engine')) ? undefined : project.engineRootFor(root, manifest, options.engine);
            const { startServer, normalizeBase } = require('./server.cjs');
            const server = await startServer({ ...options, root, engineRoot });
            output.log(`GameForgeJS: http://${options.host || '127.0.0.1'}:${server.address().port}${normalizeBase(options.basePath)}`);
            return server;
        }
        default: throw new Error(`Unknown command '${command}'. Run gameforge --help.`);
    }
    const display = result?.files && !result.dryRun ? { ...result, fileCount: result.files.length } : result;
    if (display !== result) delete display.files;
    output.log(JSON.stringify(display, null, 2));
    return result;
}

if (require.main === module) run().catch(error => { console.error(`GameForgeJS: ${error.message}`); process.exitCode = 1; });
module.exports = { parseArgs, run };
