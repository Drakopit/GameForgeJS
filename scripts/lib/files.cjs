const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIRS = ['src', 'cli', 'examples', 'scripts', 'tests'];
const IGNORED = new Set(['node_modules', '.git', '.idea', 'dist', 'build', 'publish', 'test-results']);
function walk(directory, extensions, files = []) {
    if (!fs.existsSync(directory)) return files;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (IGNORED.has(entry.name)) continue;
        const file = path.join(directory, entry.name);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
            if (entry.isSymbolicLink()) continue;
            walk(file, extensions, files);
        } else if (stat.isFile() && extensions.has(path.extname(file))) files.push(file);
    }
    return files;
}
function sourceFiles() {
    return SOURCE_DIRS.flatMap(dir => walk(path.join(ROOT, dir), new Set(['.js', '.mjs', '.cjs']))).sort();
}
module.exports = { ROOT, SOURCE_DIRS, sourceFiles, walk };
