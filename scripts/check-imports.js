const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SEARCH_DIRS = ["src", "packages", "examples", "templates", "tools", "scripts"];
const JS_EXTENSIONS = new Set([".js", ".mjs"]);

function walk(directory, files = []) {
    if (!fs.existsSync(directory)) return files;

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git") continue;
            walk(fullPath, files);
        } else if (JS_EXTENSIONS.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }

    return files;
}

function stripComments(source) {
    let output = "";
    let quote = null;
    let blockComment = false;
    let lineComment = false;

    for (let index = 0; index < source.length; index++) {
        const char = source[index];
        const next = source[index + 1];

        if (lineComment) {
            if (char === "\n") {
                lineComment = false;
                output += char;
            }
            continue;
        }

        if (blockComment) {
            if (char === "*" && next === "/") {
                blockComment = false;
                index++;
            }
            continue;
        }

        if (quote) {
            output += char;
            if (char === "\\") {
                output += next ?? "";
                index++;
                continue;
            }
            if (char === quote) quote = null;
            continue;
        }

        if (char === "\"" || char === "'" || char === "`") {
            quote = char;
            output += char;
            continue;
        }

        if (char === "/" && next === "/") {
            lineComment = true;
            index++;
            continue;
        }

        if (char === "/" && next === "*") {
            blockComment = true;
            index++;
            continue;
        }

        output += char;
    }

    return output;
}

function findSpecifiers(source) {
    const clean = stripComments(source);
    const patterns = [
        /\bimport\s+(?:[^"'()]*?\s+from\s*)?["']([^"']+)["']/g,
        /\bexport\s+(?:[^"']*?\s+from\s*)["']([^"']+)["']/g,
        /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    ];
    const specifiers = [];

    for (const pattern of patterns) {
        for (const match of clean.matchAll(pattern)) {
            specifiers.push(match[1]);
        }
    }

    return specifiers;
}

function resolveSpecifier(file, specifier) {
    if (!specifier.startsWith(".")) return null;

    const base = path.resolve(path.dirname(file), specifier);
    const candidates = path.extname(base)
        ? [base]
        : [base, `${base}.js`, path.join(base, "index.js")];

    return candidates.find(candidate => fs.existsSync(candidate)) ?? candidates[0];
}

const files = SEARCH_DIRS.flatMap(directory => walk(path.join(ROOT, directory)));
const errors = [];

for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const specifier of findSpecifiers(source)) {
        const resolved = resolveSpecifier(file, specifier);
        if (!resolved) continue;
        if (!fs.existsSync(resolved)) {
            errors.push({
                file: path.relative(ROOT, file),
                specifier,
                expected: path.relative(ROOT, resolved),
            });
        }
    }
}

if (errors.length) {
    console.error("Import path check failed:");
    for (const error of errors) {
        console.error(`- ${error.file}: '${error.specifier}' -> missing ${error.expected}`);
    }
    process.exit(1);
}

console.log(`Import path check passed: ${files.length} JS files scanned.`);
