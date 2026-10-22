const fs = require('node:fs');
const path = require('node:path');
const { inside, slash, assertNoLinks, resolveInside, readJson, json, walk } = require('./files.cjs');
const { PROJECT_FILE, loadProject, engineRootFor, doctor } = require('./project.cjs');
const { PACKAGE_FILE, PUBLIC_GROUPS, loadPackage, selectRuntime, validateGameImports } = require('./package.cjs');
const { configFile } = require('./config-paths.cjs');

const MARKER = '.gameforge-build.json';
const EXCLUDED = new Set(['node_modules', 'dist', 'build', 'publish', 'tests', 'docs', 'cli']);

function protectOutput(root, output, sourceDirectories = []) {
    assertNoLinks(root);
    assertNoLinks(output);
    if (inside(output, root)) throw new Error('Build output must not be the project directory or one of its ancestors.');
    for (const source of sourceDirectories) {
        if (inside(source, output) || inside(output, source)) throw new Error(`Build output overlaps a source directory: ${source}`);
    }
    if (fs.existsSync(output)) {
        if (!fs.statSync(output).isDirectory()) throw new Error('Build output must be a directory.');
        if (fs.readdirSync(output).length) {
            const marker = path.join(output, MARKER);
            if (!fs.existsSync(marker) || readJson(marker).projectRoot !== root) throw new Error('Refusing to replace a nonempty directory that is not a build of this project.');
        }
    }
}

function vendorImportMap(html, selected = null) {
    return html.replace(/(<script\b[^>]*type=["']importmap["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (_, open, source, close) => {
        const map = JSON.parse(source);
        for (const name of PUBLIC_GROUPS) {
            if (selected && !selected.includes(name)) { delete map.imports?.[`gameforgejs/${name}`]; continue; }
            if (map.imports?.[`gameforgejs/${name}`]) map.imports[`gameforgejs/${name}`] = `./@engine/${name}/index.js`;
        }
        if (selected && !selected.includes('core')) delete map.imports?.gameforgejs;
        else if (map.imports?.gameforgejs) map.imports.gameforgejs = './@engine/core/index.js';
        return `${open}${json(map)}${close}`;
    });
}

function planBuild(root, options = {}) {
    root = path.resolve(root);
    const projectFile = configFile(root, PROJECT_FILE);
    const modern = fs.existsSync(projectFile);
    const project = modern ? loadProject(root) : null;
    const configPath = options.config ? path.resolve(root, options.config) : path.join(root, 'gameforge.publisher.json');
    const legacy = !modern && fs.existsSync(configPath) ? readJson(configPath) : null;
    const configRoot = path.dirname(configPath);
    if (legacy) {
        for (const key of ['gameRoot', 'engineRoot', 'entry', 'output']) if (legacy[key] !== undefined && typeof legacy[key] !== 'string') throw new Error(`Publisher ${key} must be a string.`);
        for (const key of ['engineModules', 'gameFiles', 'exclude']) if (legacy[key] !== undefined && (!Array.isArray(legacy[key]) || legacy[key].some(value => typeof value !== 'string'))) throw new Error(`Publisher ${key} must be an array of strings.`);
    }
    if (!modern && !legacy) throw new Error('Missing gameforge.project.json. Create a project, or provide --config <publisher.json>.');
    const output = path.resolve(root, options.output || legacy?.output || 'dist');
    const engine = legacy ? path.resolve(configRoot, legacy.engineRoot || '.') : engineRootFor(root, project, options.engine);
    const gameRoot = legacy ? path.resolve(configRoot, legacy.gameRoot || '.') : root;
    const engineSource = path.join(engine, 'src');
    const protectedDirectories = [path.join(root, 'src'), path.join(root, 'assets'), path.join(root, 'config'), path.join(root, 'examples'), path.join(root, 'cli'), engineSource];
    if (gameRoot !== root) protectedDirectories.push(gameRoot);
    protectOutput(root, output, protectedDirectories);
    if (modern) doctor(root, options);
    const entries = new Map();
    let runtime = null;
    function add(source, relative, content) {
        const target = resolveInside(output, relative);
        if (source) {
            assertNoLinks(source);
            if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`Missing build input: ${source}`);
            if (inside(output, source)) throw new Error(`Build input is inside output: ${source}`);
        }
        const key = slash(path.relative(output, target));
        const old = entries.get(key);
        if (old && old.source !== source) throw new Error(`Build destination collision: ${key}`);
        entries.set(key, { source, relative: key, ...(content !== undefined ? { content } : {}) });
    }
    function addTree(source, prefix, exclude = EXCLUDED) {
        for (const file of walk(source, { exclude })) add(file.source, `${prefix ? `${prefix}/` : ''}${file.relative}`);
    }

    if (modern) {
        const manifest = loadPackage(root);
        runtime = manifest ? selectRuntime(engineSource, manifest) : null;
        const exclude = new Set(EXCLUDED);
        if (inside(root, output)) exclude.add(path.relative(root, output).split(path.sep)[0]);
        for (const file of walk(root, { exclude })) {
            if ([PROJECT_FILE, PACKAGE_FILE, `config/${PROJECT_FILE}`, `config/${PACKAGE_FILE}`, 'package.json', 'package-lock.json', 'README.md'].includes(file.relative)) continue;
            if (file.relative.startsWith('@engine/')) throw new Error('@engine is reserved for build output; do not copy runtime sources into a project.');
            add(file.source, file.relative, file.relative === project.entry ? vendorImportMap(fs.readFileSync(file.source, 'utf8'), runtime?.modules) : undefined);
        }
        if (runtime) {
            validateGameImports([...entries.values()], runtime.modules, output);
            for (const file of runtime.files) add(file.source, `@engine/${file.relative}`);
        } else addTree(engineSource, '@engine', new Set(['node_modules', 'tests']));
        if (project.entry !== 'index.html') throw new Error('The portable build entry must be index.html at the project root.');
    } else {
        if (!inside(engine, gameRoot)) throw new Error('Legacy publication requires gameRoot inside engineRoot. Use a generated project for independent games.');
        const relativeGame = slash(path.relative(engine, gameRoot));
        const modules = legacy.engineModules || ['src'];
        for (const module of modules) {
            const source = resolveInside(engine, module);
            if (!fs.existsSync(source)) throw new Error(`Missing engine module: ${module}`);
            if (fs.statSync(source).isDirectory()) addTree(source, module);
            else add(source, module);
        }
        const files = legacy.gameFiles?.length ? legacy.gameFiles : ['.'];
        for (const file of files) {
            const source = resolveInside(gameRoot, file);
            const destination = slash(path.relative(engine, source));
            if (!fs.existsSync(source)) throw new Error(`Missing game file: ${file}`);
            if (fs.statSync(source).isDirectory()) addTree(source, destination);
            else add(source, destination);
        }
        const entry = resolveInside(gameRoot, legacy.entry || 'index.html');
        if (!fs.existsSync(entry)) throw new Error('Publisher entry does not exist.');
        function relocate(url) {
            if (!url || /^(?:[a-z]+:|\/\/|#|\/)/i.test(url)) return url;
            const [pathname, suffix = ''] = url.split(/(?=[?#])/s);
            const local = path.resolve(path.dirname(entry), pathname);
            const candidate = fs.existsSync(local) ? local : path.resolve(engine, pathname);
            if (!inside(engine, candidate)) throw new Error(`Entry reference escapes engineRoot: ${url}`);
            return `./${slash(path.relative(engine, candidate))}${suffix}`;
        }
        let html = fs.readFileSync(entry, 'utf8').replace(/\b(src|href)\s*=\s*(["'])([^"']+)\2/gi, (_, attribute, quote, value) => `${attribute}=${quote}${relocate(value)}${quote}`);
        html = html.replace(/(<script\b[^>]*type=["']importmap["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (_, open, source, close) => {
            const map = JSON.parse(source);
            if (map.imports) for (const key of Object.keys(map.imports)) map.imports[key] = relocate(map.imports[key]);
            return `${open}${json(map)}${close}`;
        });
        if (relativeGame) add(entry, `${relativeGame}/${path.basename(entry)}`);
        entries.delete('index.html');
        add(entry, 'index.html', html);
    }
    if (!entries.has('index.html')) throw new Error('Build plan is missing index.html.');
    return { root, output, engine, runtimeModules: runtime?.modules ?? null, files: [...entries.values()].sort((a, b) => a.relative.localeCompare(b.relative)), protectedDirectories };
}

function executeBuild(plan, { dryRun = false } = {}) {
    protectOutput(plan.root, plan.output, plan.protectedDirectories);
    if (dryRun) return { output: plan.output, runtimeModules: plan.runtimeModules, files: plan.files.map(file => file.relative), dryRun: true };
    const parent = path.dirname(plan.output);
    fs.mkdirSync(parent, { recursive: true });
    assertNoLinks(parent);
    const stage = fs.mkdtempSync(path.join(parent, '.gameforge-stage-'));
    let backup;
    try {
        for (const file of plan.files) {
            const target = resolveInside(stage, file.relative);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            if (file.content !== undefined) fs.writeFileSync(target, file.content);
            else { assertNoLinks(file.source); fs.copyFileSync(file.source, target); }
        }
        fs.writeFileSync(path.join(stage, MARKER), json({ schemaVersion: 1, projectRoot: plan.root }));
        protectOutput(plan.root, plan.output, plan.protectedDirectories);
        if (fs.existsSync(plan.output)) {
            backup = `${stage}-previous`;
            fs.renameSync(plan.output, backup);
        }
        fs.renameSync(stage, plan.output);
        if (backup) fs.rmSync(backup, { recursive: true });
    } catch (error) {
        if (backup && fs.existsSync(backup) && !fs.existsSync(plan.output)) fs.renameSync(backup, plan.output);
        if (fs.existsSync(stage)) fs.rmSync(stage, { recursive: true });
        throw error;
    }
    return { output: plan.output, runtimeModules: plan.runtimeModules, files: plan.files.map(file => file.relative), dryRun: false };
}

function build(root, options = {}) { return executeBuild(planBuild(root, options), options); }
module.exports = { MARKER, protectOutput, vendorImportMap, planBuild, executeBuild, build };
