const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const acorn = require("acorn");
const OUTPUT_DIRECTORY = path.join(ROOT, "docs", "reference", "api");
const CHECK = process.argv.includes("--check");
let stale = 0;
const MODULES = Object.entries(require("../package.json").exports)
    .filter(([name, target]) => name !== "." && name !== "./package.json" && typeof target === "string")
    .map(([name, target]) => ({ name: name.slice(2), sourceDir: path.dirname(target), summary: `Public ${name.slice(2)} entry point: gameforgejs/${name.slice(2)}.` }));
function emit(file, content) {
    if (CHECK) {
        if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== content) {
            stale++;
            console.error(`Outdated generated documentation: ${path.relative(ROOT, file)}`);
        }
    } else {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
    }
}

function read(file) {
    return fs.readFileSync(file, "utf8");
}

function normalizeFile(file) {
    return path.normalize(file);
}

function sourceLink(file) {
    return path.relative(OUTPUT_DIRECTORY, file).replaceAll(path.sep, "/");
}

function parseBarrel(file, visited = new Set()) {
    const normalized = normalizeFile(file);
    if (visited.has(normalized)) return [];
    visited.add(normalized);
    const tree = acorn.parse(read(normalized), { ecmaVersion: "latest", sourceType: "module" });
    const entries = [];
    for (const node of tree.body) {
        if (node.type === "ExportAllDeclaration") {
            entries.push(...parseBarrel(path.resolve(path.dirname(normalized), node.source.value), new Set(visited)));
        } else if (node.type === "ExportNamedDeclaration") {
            if (node.source) {
                const target = path.resolve(path.dirname(normalized), node.source.value);
                const nested = parseBarrel(target, new Set(visited));
                for (const item of node.specifiers) {
                    const original = item.local.name;
                    const resolved = nested.find(entry => entry.name === original);
                    entries.push({ ...(resolved ?? { declarationName: original, file: target }), name: item.exported.name });
                }
            } else if (node.declaration) {
                const declaration = node.declaration;
                const names = declaration.id ? [declaration.id.name] : (declaration.declarations ?? []).map(d => d.id.name).filter(Boolean);
                for (const name of names) entries.push({ name, declarationName: name, file: normalized });
            }
        }
    }
    return [...new Map(entries.map(entry => [entry.name, entry])).values()].sort((a, b) => a.name.localeCompare(b.name));
}

function cleanDoc(raw) {
    return raw
        .split("\n")
        .map(line => line.replace(/^\s*\*\s?/, "").trim());
}

function parseDoc(raw) {
    if (!raw) return null;

    const lines = cleanDoc(raw);
    const description = [];
    const params = [];
    let returns = "";
    let deprecated = "";
    let example = "";
    let current = "description";

    for (const line of lines) {
        if (line.startsWith("@param ")) {
            const match = line.match(/^@param\s+\{([^}]+)\}\s+(\[[^\]]+\]|\S+)\s*(?:-\s*)?(.*)$/);
            if (match) params.push({ type: match[1], name: match[2], description: match[3] });
            current = "";
            continue;
        }
        if (line.startsWith("@returns ") || line.startsWith("@return ")) {
            const match = line.match(/^@returns?\s+\{([^}]+)\}\s*(?:-\s*)?(.*)$/);
            if (match) returns = `\`${match[1]}\`${match[2] ? ` - ${match[2]}` : ""}`;
            current = "";
            continue;
        }
        if (line.startsWith("@deprecated")) {
            deprecated = line.replace("@deprecated", "").trim() || "Deprecated.";
            current = "";
            continue;
        }
        if (line.startsWith("@example")) {
            current = "example";
            continue;
        }
        if (line.startsWith("@summary ") || line.startsWith("@description ")) {
            description.push(line.replace(/^@(summary|description)\s+/, ""));
            current = "description";
            continue;
        }
        if (line.startsWith("@")) {
            current = "";
            continue;
        }
        if (current === "description" && line) description.push(line);
        if (current === "example") example += `${line}\n`;
    }

    return {
        description: description.join(" ").replace(/\s+/g, " ").trim(),
        params,
        returns,
        deprecated,
        example: example.trim(),
    };
}

function findDeclaration(entry) {
    const source = read(entry.file);
    const name = entry.declarationName ?? entry.name;
    const pattern = new RegExp(
        String.raw`(?:\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*)?export\s+(class|(?:async\s+)?function|const)\s+${name}\b`,
    );
    const match = source.match(pattern);
    const kind = match?.[2]?.replace("async ", "") ?? "export";
    return {
        ...entry,
        kind,
        doc: parseDoc(match?.[1]),
        members: kind === "class" ? findClassMembers(source, name) : findDocumentedMembers(source),
    };
}

function findDocumentedMembers(source) {
    const pattern = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*((?:static\s+)?[A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g;
    const members = [];
    for (const match of source.matchAll(pattern)) {
        const name = match[2].trim();
        if (name === "constructor") continue;
        const doc = parseDoc(match[1]);
        if (doc?.description || doc?.params.length || doc?.returns || doc?.deprecated) {
            members.push({ name, doc });
        }
    }
    return members;
}

function findClassMembers(source, className) {
    const classMatch = source.match(new RegExp(String.raw`export\s+class\s+${className}\b`));
    if (!classMatch) return findDocumentedMembers(source);

    const classStart = classMatch.index;
    const bodyStart = source.indexOf("{", classStart);
    const bodyEnd = findMatchingBrace(source, bodyStart);
    if (bodyStart === -1 || bodyEnd === -1) return findDocumentedMembers(source);

    const body = source.slice(bodyStart + 1, bodyEnd);
    const pattern = /^\s*(?:\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*)?((?:static\s+)?[A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{/gm;
    const skip = new Set(["constructor", "if", "for", "while", "switch", "catch"]);
    const members = [];
    const seen = new Set();

    for (const match of body.matchAll(pattern)) {
        const name = match[2].trim();
        if (skip.has(name) || seen.has(name)) continue;
        seen.add(name);

        const doc = parseDoc(match[1]) ?? { description: "", params: [], returns: "", deprecated: "", example: "" };
        members.push({
            name,
            signature: `${name}(${match[3].replace(/\s+/g, " ").trim()})`,
            doc,
        });
    }

    return members;
}

function findMatchingBrace(source, openIndex) {
    if (openIndex < 0) return -1;

    let depth = 0;
    let quote = null;
    let lineComment = false;
    let blockComment = false;

    for (let index = openIndex; index < source.length; index++) {
        const char = source[index];
        const next = source[index + 1];

        if (lineComment) {
            if (char === "\n") lineComment = false;
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
            if (char === "\\") {
                index++;
                continue;
            }
            if (char === quote) quote = null;
            continue;
        }

        if (char === "\"" || char === "'" || char === "`") {
            quote = char;
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

        if (char === "{") depth++;
        if (char === "}") {
            depth--;
            if (depth === 0) return index;
        }
    }

    return -1;
}

function escapeCell(value) {
    return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function renderParams(params) {
    if (!params?.length) return "";
    const rows = params
        .map(param => `| \`${escapeCell(param.name)}\` | \`${escapeCell(param.type)}\` | ${escapeCell(param.description)} |`)
        .join("\n");
    return `\n**Parameters**\n\n| Name | Type | Description |\n| --- | --- | --- |\n${rows}\n`;
}

function renderSymbol(symbol) {
    const summary = symbol.doc?.description
        || (symbol.doc?.deprecated ? "Deprecated compatibility API." : "Public export. Detailed JSDoc has not been added yet.");
    const output = [
        `## ${symbol.name}`,
        "",
        `\`${symbol.kind}\` from [\`${path.relative(ROOT, symbol.file).replaceAll(path.sep, "/")}\`](${sourceLink(symbol.file)})`,
        "",
        summary,
    ];

    if (symbol.doc?.deprecated) {
        output.push("", `> Deprecated: ${symbol.doc.deprecated}`);
    }
    if (symbol.doc?.params?.length) output.push(renderParams(symbol.doc.params).trimEnd());
    if (symbol.doc?.returns) output.push("", `**Returns:** ${symbol.doc.returns}`);
    if (symbol.doc?.example) output.push("", "**Example**", "", "```js", symbol.doc.example, "```");

    if (symbol.members.length) {
        output.push("", "### Methods", "");
        symbol.members.forEach(member => {
            output.push(`#### \`${member.signature ?? `${member.name}()`}\``, "", member.doc.description || "JSDoc pending.");
            if (member.doc.params.length) output.push(renderParams(member.doc.params).trimEnd());
            if (member.doc.returns) output.push("", `**Returns:** ${member.doc.returns}`);
        });
    }
    return output.join("\n");
}

function generateModule(module) {
    const barrel = path.join(ROOT, module.sourceDir, "index.js");
    const symbols = parseBarrel(barrel).map(findDeclaration);
    const documented = symbols.filter(symbol => symbol.doc?.description || symbol.doc?.deprecated).length;
    const rows = symbols
        .map(symbol => `| [\`${symbol.name}\`](#${symbol.name.toLowerCase()}) | \`${symbol.kind}\` | ${escapeCell(symbol.doc?.description || (symbol.doc?.deprecated ? "Deprecated compatibility API." : "JSDoc pending."))} |`)
        .join("\n");
    const content = [
        `# ${module.name} API`,
        "",
        "<!-- Generated by scripts/generate-docs.js. Edit source JSDoc, then run npm run docs. -->",
        "",
        module.summary,
        "",
        `Documented exports: **${documented}/${symbols.length}**.`,
        "",
        "| Symbol | Kind | Summary |",
        "| --- | --- | --- |",
        rows,
        ...symbols.flatMap(symbol => ["", renderSymbol(symbol)]),
        "",
    ].join("\n");

    emit(path.join(OUTPUT_DIRECTORY, `${module.name.replaceAll('/', '-')}.md`), content);
    return { module, symbols, documented };
}

function generateIndex(results) {
    const rows = results
        .map(result => `| [${result.module.name}](./${result.module.name.replaceAll('/', '-')}.md) | ${result.module.summary} | ${result.documented}/${result.symbols.length} |`)
        .join("\n");
    const content = `# GameForgeJS API Reference

<!-- Generated by scripts/generate-docs.js. Edit source JSDoc, then run npm run docs. -->

This is the generated API reference for the public GameForgeJS modules. The documentation source is the JSDoc placed beside each exported class or function in the engine.

Regenerate after changing public APIs or JSDoc:

\`\`\`sh
npm run docs
\`\`\`

| Module | Purpose | Documented Exports |
| --- | --- | --- |
${rows}

## Guides

Human-written tutorials and architecture explanations start at [Docs Home](../../index.md).
`;
    emit(path.join(OUTPUT_DIRECTORY, "index.md"), content);
}

if (!CHECK) fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
const results = MODULES.map(generateModule);
generateIndex(results);

const documented = results.reduce((total, result) => total + result.documented, 0);
const exportsCount = results.reduce((total, result) => total + result.symbols.length, 0);
console.log(`Generated docs/reference/api reference: ${documented}/${exportsCount} public exports documented.`);

const catalogPath = path.join(ROOT, "examples/catalog.json");
const readmePath = path.join(ROOT, "README.md");
if (fs.existsSync(catalogPath)) {
    const catalog = JSON.parse(read(catalogPath));
    const table = ["| Example | Dimension | Purpose |", "| --- | --- | --- |", ...catalog.map(entry => `| [${entry.name}](examples/${entry.path}) | ${entry.dimension} | ${entry.description} |`)].join("\n");
    const readme = read(readmePath);
    if (!readme.includes("<!-- examples:start -->") || !readme.includes("<!-- examples:end -->")) {
        throw new Error("README is missing generated example-catalog markers.");
    }
    emit(readmePath, readme.replace(/<!-- examples:start -->[\s\S]*?<!-- examples:end -->/, `<!-- examples:start -->\n${table}\n<!-- examples:end -->`));
}
if (CHECK && stale) process.exitCode = 1;
