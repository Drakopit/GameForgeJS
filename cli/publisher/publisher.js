// Compatibility entry point; publication uses the same validated build plan.
const { run } = require('../index.cjs');
const args = process.argv.slice(2).map(value => value === '-c' ? '--config' : value);
run(['build', ...args]).catch(error => {
    console.error(`GameForgeJS: ${error.message}`);
    process.exitCode = 1;
});
