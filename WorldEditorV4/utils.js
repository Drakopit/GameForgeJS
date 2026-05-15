export function clone(value) {
    return typeof structuredClone === "function"
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
}

export function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, match => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
    }[match]));
}

export function snapValue(value, step) {
    const safeStep = Math.max(1, Number(step) || 1);
    return Math.round(value / safeStep) * safeStep;
}

export function downloadJson(name, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

export async function copyJson(data) {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
}

export async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
}

export function numberOr(value, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}
