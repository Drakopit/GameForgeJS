const grid = document.querySelector("#examples");
const status = document.querySelector("#status");
const count = document.querySelector("#count");
const aliases = {
    fighting: "fighting2d",
    adventure: "adventure2d",
    zelda: "adventure2d",
    solar: "solar3d",
    mmo: "online",
    terraria: "online",
};

function exampleUrl(entry) {
    return new URL("../" + entry.path, import.meta.url);
}

function render(catalog, dimension = "all") {
    const visible = catalog.filter(entry => dimension === "all" || entry.dimension === dimension);
    grid.replaceChildren();
    for (const [index, entry] of visible.entries()) {
        const card = document.createElement("article");
        card.className = "card";
        const meta = document.createElement("div");
        meta.className = "card-meta";
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = entry.dimension;
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        meta.append(badge, number);
        const heading = document.createElement("h2");
        heading.textContent = entry.name;
        const description = document.createElement("p");
        description.textContent = entry.description;
        const link = document.createElement("a");
        link.className = "play-link";
        link.href = exampleUrl(entry).href;
        link.textContent = "Run example →";
        link.setAttribute("aria-label", "Run " + entry.name);
        card.append(meta, heading, description, link);
        grid.append(card);
    }
    count.textContent = visible.length + " examples";
}

try {
    const response = await fetch(new URL("../catalog.json", import.meta.url));
    if (!response.ok) throw new Error("Catalog request failed (" + response.status + ").");
    const catalog = await response.json();
    if (!Array.isArray(catalog)) throw new Error("The example catalog must be an array.");
    for (const entry of catalog) {
        if (!entry.id || !entry.name || !entry.description ||
            !["2D", "3D"].includes(entry.dimension) ||
            !/^[A-Za-z0-9_-]+\/index\.html$/.test(entry.path)) {
            throw new Error("Invalid example catalog entry.");
        }
    }
    const params = new URLSearchParams(location.search);
    const requested = params.get("demo");
    const selected = aliases[requested] ?? requested;
    const demo = catalog.find(entry => entry.id === selected);
    if (demo) {
        const destination = exampleUrl(demo);
        params.delete("demo");
        destination.search = params.toString();
        destination.hash = location.hash;
        location.replace(destination.href);
    } else {
        render(catalog);
        status.hidden = !selected || selected === "admin";
        status.textContent = "Example '" + selected + "' was not found. Choose an example below.";
        document.querySelectorAll("[data-filter]").forEach(button => {
            button.addEventListener("click", () => {
                document.querySelectorAll("[data-filter]").forEach(item =>
                    item.setAttribute("aria-pressed", String(item === button)));
                render(catalog, button.dataset.filter);
            });
        });
    }
} catch (error) {
    status.hidden = false;
    status.textContent = "Could not load the examples. Start the development server and reload this page.";
    console.error(error);
}
