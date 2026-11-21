const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const { ROOT, sourceFiles } = require('./lib/files.cjs');
const files = sourceFiles();
let errors = 0;
for (const file of files) {
    try { acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true, allowReturnOutsideFunction: file.endsWith('.cjs') }); }
    catch (error) { errors++; console.error(`${path.relative(ROOT, file)}: ${error.message}`); }
}
console.log(`Syntax check: ${files.length} JavaScript files; ${errors} errors.`);
if (errors) process.exitCode = 1;
