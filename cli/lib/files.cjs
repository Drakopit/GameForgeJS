const fs = require('node:fs');
const path = require('node:path');

const slash = value => value.split(path.sep).join('/');
const inside = (root, target) => {
    const relative = path.relative(path.resolve(root), path.resolve(target));
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
};

function resolveInside(root, relative) {
    if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) throw new Error(`Expected a relative path: ${relative}`);
    const target = path.resolve(root, relative);
    if (!inside(root, target)) throw new Error(`Path escapes project: ${relative}`);
    assertNoLinks(target);
    return target;
}

function assertNoLinks(target) {
    let current = path.resolve(target);
    while (true) {
        if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
            // Some Windows providers mark regular projected files as reparse
            // points while realpath stays identical. Actual links (especially
            // directory links) remain forbidden in managed write paths.
            const projectedFile = fs.statSync(current).isFile() && path.resolve(fs.realpathSync(current)) === current;
            if (!projectedFile) throw new Error(`Symbolic links are not allowed in managed paths: ${current}`);
        }
        const parent = path.dirname(current);
        if (parent === current) return;
        current = parent;
    }
}

function readJson(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (error) { throw new Error(`Cannot read JSON ${file}: ${error.message}`); }
}

const json = value => `${JSON.stringify(value, null, 2)}\n`;

function walk(root, { exclude = new Set(), prefix = '' } = {}) {
    const files = [];
    if (!fs.existsSync(root)) throw new Error(`Source does not exist: ${root}`);
    for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (exclude.has(entry.name) || entry.name.startsWith('.')) continue;
        const source = path.join(root, entry.name);
        if (entry.isSymbolicLink()) {
            if (fs.statSync(source).isFile() && path.resolve(fs.realpathSync(source)) === path.resolve(source)) {
                files.push({ source, relative: prefix ? `${prefix}/${entry.name}` : entry.name });
                continue;
            }
            throw new Error(`Source contains a symbolic link: ${source}`);
        }
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) files.push(...walk(source, { exclude, prefix: relative }));
        else if (entry.isFile()) files.push({ source, relative });
    }
    return files;
}

// Plans are checked in full before the first write. Existing user files are never
// overwritten unless their exact previous contents were included in the plan.
function applyWrites(root, writes, { dryRun = false } = {}) {
    const checked = writes.map(write => {
        const target = resolveInside(root, write.path);
        if (fs.existsSync(target)) {
            if (!fs.lstatSync(target).isFile()) throw new Error(`Destination is not a file: ${target}`);
            const actual = fs.readFileSync(target, 'utf8');
            if (actual === write.content) return null;
            if (write.previous === undefined || actual !== write.previous) throw new Error(`Conflict: ${write.path} already contains user changes.`);
        } else if (write.previous !== undefined) throw new Error(`Conflict: ${write.path} disappeared.`);
        return { ...write, target };
    }).filter(Boolean);
    if (!dryRun) for (const write of checked) {
        fs.mkdirSync(path.dirname(write.target), { recursive: true });
        fs.writeFileSync(write.target, write.content);
    }
    return { files: checked.map(write => write.path), dryRun };
}

module.exports = { slash, inside, resolveInside, assertNoLinks, readJson, json, walk, applyWrites };
