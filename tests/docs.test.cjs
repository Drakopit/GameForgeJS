const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function walk(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(file) : [file];
    });
}

test("documentation local links point to existing files", () => {
    const documents = [
        path.join(root, "README.md"),
        ...walk(path.join(root, "docs")).filter(file => file.endsWith(".md")),
    ];
    const broken = [];
    for (const file of documents) {
        const source = fs.readFileSync(file, "utf8");
        const links = [
            ...source.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g),
            ...source.matchAll(/\bsrc=["']([^"']+)["']/g),
        ];
        for (const match of links) {
            const target = match[1].split("#")[0];
            if (!target || /^(?:https?:|mailto:|data:)/.test(target)) continue;
            const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
            if (!fs.existsSync(resolved)) {
                broken.push(path.relative(root, file) + ": " + target);
            }
        }
    }
    assert.deepEqual(broken, [], "Fix broken documentation links:\n" + broken.join("\n"));
});

test("example catalog declares unique runnable game entries", () => {
    const examples = path.join(root, "examples");
    const catalog = JSON.parse(fs.readFileSync(path.join(examples, "catalog.json"), "utf8"));
    assert.ok(Array.isArray(catalog) && catalog.length > 0);
    assert.equal(new Set(catalog.map(entry => entry.id)).size, catalog.length, "Example IDs must be unique");
    assert.equal(new Set(catalog.map(entry => entry.path)).size, catalog.length, "Example entries must be unique");
    for (const entry of catalog) {
        assert.match(entry.id, /^[a-z0-9-]+$/);
        assert.ok(entry.name && entry.description, "Each example needs display metadata");
        assert.ok(["2D", "3D"].includes(entry.dimension));
        assert.match(entry.path, /^[A-Za-z0-9_-]+\/index\.html$/);
        const folder = path.dirname(path.join(examples, entry.path));
        for (const name of ["index.html", "main.js"]) {
            assert.ok(fs.existsSync(path.join(folder, name)), entry.id + " is missing " + name);
        }
        assert.ok(fs.existsSync(require('../cli/lib/config-paths.cjs').configFile(folder, 'game.config.json')));
    }
});

test("manual guides use public imports instead of runtime implementation paths", () => {
    const documents = walk(path.join(root, "docs")).filter(file =>
        file.endsWith(".md") &&
        !file.includes(path.join("reference", "api")) &&
        !file.includes(path.join("migrations", "repository-layout.md")));
    const stale = [];
    for (const file of documents) {
        const source = fs.readFileSync(file, "utf8");
        for (const match of source.matchAll(/\bfrom\s+["']([^"']+)["']/g)) {
            if (/^(?:\.\.\/|\.\/)+(?:src|packages)\//.test(match[1])) {
                stale.push(path.relative(root, file) + ": " + match[1]);
            }
        }
    }
    assert.deepEqual(stale, [], "Manual guides must consume the documented public API");
});
