const fs = require('node:fs');
const path = require('node:path');
const { assertNoLinks } = require('./files.cjs');

// Paths stored in project metadata remain relative to the game root.
function configFile(root, name) {
    const candidates = [path.join(root, 'config', name), path.join(root, name)];
    candidates.forEach(assertNoLinks);
    const found = candidates.filter(file => fs.existsSync(file));
    if (found.length > 1) throw new Error(`Ambiguous configuration: keep only one ${name}, in config/ or the project root.`);
    return found[0] ?? candidates[0];
}

module.exports = { configFile };
