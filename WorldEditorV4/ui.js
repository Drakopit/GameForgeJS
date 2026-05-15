import { escapeHtml } from "./utils.js";

const TYPE_LABELS = Object.freeze({
    platform: "Plataforma",
    object: "Objeto",
    enemy: "Inimigo",
    player: "Player spawn",
    parallax: "Parallax",
});

export class EditorUI {
    constructor({ state, catalog }) {
        this.state = state;
        this.catalog = catalog;
        this.elements = {
            status: element("status"),
            entityList: element("entityList"),
            props: element("props"),
            emptyProps: element("emptyProps"),
            jsonSelect: element("jsonSelect"),
            jsonBox: element("jsonBox"),
            catalogSelect: element("catalogSelect"),
            zoomInput: element("zoomInput"),
            snapInput: element("snapInput"),
            phaseSelect: element("phaseSelect"),
            manifestProfileSelect: element("manifestProfileSelect"),
            manifestBaseInput: element("manifestBaseInput"),
            stageFileInput: element("stageFileInput"),
            enemiesFileInput: element("enemiesFileInput"),
            playerFileInput: element("playerFileInput"),
        };
    }

    setStatus(message) {
        this.elements.status.textContent = message;
    }

    fillCatalog() {
        const select = this.elements.catalogSelect;
        select.innerHTML = "";

        for (const item of this.catalog.objectOptions()) {
            const option = document.createElement("option");
            option.value = `${item.kind}:${item.name}`;
            option.textContent = `${item.kind === "animationRef" ? "[anim]" : "[sprite]"} ${item.name}`;
            select.appendChild(option);
        }
    }

    selectedCatalogItem() {
        const [, name] = this.elements.catalogSelect.value.split(":");
        return this.catalog.find(name);
    }

    renderAll(onPropertyChange) {
        this.renderList();
        this.renderProps(onPropertyChange);
        this.updateJson();
        this.elements.zoomInput.value = this.state.camera.zoom.toFixed(2);
        this.elements.snapInput.value = String(this.state.snap);
    }

    renderList() {
        const list = this.elements.entityList;
        list.innerHTML = "";

        for (const entity of this.state.selectableEntities()) {
            const item = document.createElement("div");
            item.className = `item ${isSelected(this.state, entity) ? "selected" : ""}`;
            item.onclick = () => {
                this.state.select(entity.type, entity.index);
                this.renderList();
                this.renderProps(this.onPropertyChange);
                this.updateJson();
                this.onSelectionChange?.();
            };

            const id = entity.ref.id ?? entity.ref.sprite ?? "player_spawn";
            let meta = `x:${Math.round(entity.ref.x ?? 0)} y:${Math.round(entity.ref.y ?? 0)}`;
            if (entity.ref.width) meta += ` - ${entity.ref.width}x${entity.ref.height}`;
            item.innerHTML = `<div class="title"><span class="pill-${entity.type}">${typeLabel(entity.type)}</span> - ${escapeHtml(id)}</div><div class="meta">${meta}</div>`;
            list.appendChild(item);
        }
    }

    renderProps(onPropertyChange) {
        this.onPropertyChange = onPropertyChange;
        const selected = this.state.selected();
        const props = this.elements.props;
        const empty = this.elements.emptyProps;

        if (!selected) {
            props.classList.add("hidden");
            empty.classList.remove("hidden");
            props.innerHTML = "";
            return;
        }

        props.classList.remove("hidden");
        empty.classList.add("hidden");
        props.innerHTML = this.propsHtml(selected);

        props.querySelectorAll("input,select").forEach(input => {
            input.oninput = input.onchange = () => {
                this.applyPropertyInput(input);
                onPropertyChange?.();
            };
        });
    }

    propsHtml(entity) {
        if (entity.type === "platform") {
            return [
                field(entity, "id", "id"),
                field(entity, "x", "x", "number"),
                field(entity, "y", "y", "number"),
                field(entity, "width", "width", "number"),
                field(entity, "height", "height", "number"),
                field(entity, "material", "material"),
                field(entity, "terrain", "terrain", "select", this.catalog.terrainOptions().map(item => item.name)),
                field(entity, "solid", "solid", "bool"),
                field(entity, "visible", "visible", "bool"),
            ].join("");
        }

        if (entity.type === "object") {
            return [
                field(entity, "id", "id"),
                field(entity, "x", "x", "number"),
                field(entity, "y", "y", "number"),
                field(entity, "width", "width", "number"),
                field(entity, "height", "height", "number"),
                field(entity, "zIndex", "zIndex", "number"),
                field(entity, "solid", "solid", "bool"),
                field(entity, "visible", "visible", "bool"),
                refNameField(entity, this.catalog.objectOptions().map(item => item.name)),
            ].join("");
        }

        if (entity.type === "enemy") {
            return [
                field(entity, "id", "id"),
                field(entity, "x", "x", "number"),
                field(entity, "y", "y", "number"),
                `<div class="field full"><label>Observacao</label><input value="usa enemyDefaults quando so tem id/x/y" disabled></div>`,
            ].join("");
        }

        if (entity.type === "player") {
            return [
                field(entity, "x", "spawn x", "number"),
                field(entity, "y", "spawn y", "number"),
                playerField("playerRoot", "scale", "scale", this.state.player.player.scale ?? 1, 0.1),
                playerField("movement", "speed", "speed", this.state.player.player.movement?.speed ?? 0),
                playerField("movement", "jumpStrength", "jumpStrength", this.state.player.player.movement?.jumpStrength ?? 0),
                playerField("stats", "hp", "hp", this.state.player.player.stats?.hp ?? 0),
            ].join("");
        }

        if (entity.type === "parallax") {
            return [
                field(entity, "id", "id"),
                field(entity, "sprite", "sprite"),
                field(entity, "x", "x", "number"),
                field(entity, "y", "y", "number"),
                field(entity, "width", "width", "number"),
                field(entity, "height", "height", "number"),
                field(entity, "scrollRatioX", "scroll X", "number"),
                field(entity, "scrollRatioY", "scroll Y", "number"),
                field(entity, "repeatX", "repeatX", "bool"),
            ].join("");
        }

        return "";
    }

    applyPropertyInput(input) {
        const selected = this.state.selected();
        if (!selected) return;

        const key = input.dataset.k;
        let value = input.value;
        if (input.dataset.type === "number" || input.type === "number") value = Number(value);
        if (input.dataset.type === "bool") value = value === "true";

        if (input.dataset.doc === "playerRoot") this.state.player.player[key] = value;
        else if (input.dataset.doc === "movement") this.state.player.player.movement[key] = value;
        else if (input.dataset.doc === "stats") this.state.player.player.stats[key] = value;
        else if (key === "refName") this.applyObjectReference(selected, value);
        else selected.ref[key] = value;
    }

    applyObjectReference(selected, name) {
        delete selected.ref.spriteRef;
        delete selected.ref.animationRef;
        const item = this.catalog.find(name);
        selected.ref[item?.kind ?? "spriteRef"] = name;
    }

    updateJson() {
        const key = this.elements.jsonSelect.value;
        this.elements.jsonBox.value = JSON.stringify(this.state.activeDocument(key), null, 2);
    }

    applyJsonFromEditor() {
        const key = this.elements.jsonSelect.value;
        this.state.setActiveDocument(key, JSON.parse(this.elements.jsonBox.value));
    }

    activeJsonKey() {
        return this.elements.jsonSelect.value;
    }

    activeDownloadName() {
        const key = this.activeJsonKey();
        if (this.elements.manifestProfileSelect.value === "custom") {
            if (key === "enemies") return this.elements.enemiesFileInput.value.trim() || this.state.enemiesFileName();
            if (key === "player") return this.elements.playerFileInput.value.trim() || "player.json";
            return this.elements.stageFileInput.value.trim() || this.state.stageFileName();
        }

        if (key === "enemies") return this.state.enemiesFileName();
        if (key === "player") return "player.json";
        return this.state.stageFileName();
    }

    manifestRequest(phaseConfig) {
        const profile = this.elements.manifestProfileSelect.value;

        if (profile !== "custom") {
            return {};
        }

        return {
            basePath: this.ensureTrailingSlash(this.elements.manifestBaseInput.value.trim()),
            stageFile: this.elements.stageFileInput.value.trim() || phaseConfig.stageFile,
            enemiesFile: this.elements.enemiesFileInput.value.trim() || phaseConfig.enemiesFile,
            playerFile: this.elements.playerFileInput.value.trim() || "player.json",
        };
    }

    syncManifestFields(phaseConfig) {
        if (this.elements.manifestProfileSelect.value !== "custom") {
            this.elements.manifestBaseInput.value = "DemoAdvanced/Assets/Manifests/advanced/";
            this.elements.stageFileInput.value = phaseConfig.stageFile;
            this.elements.enemiesFileInput.value = phaseConfig.enemiesFile;
            this.elements.playerFileInput.value = "player.json";
        }
    }

    ensureTrailingSlash(value) {
        if (!value) return "DemoAdvanced/Assets/Manifests/advanced/";
        return value.endsWith("/") ? value : `${value}/`;
    }
}

export function element(id) {
    const found = document.getElementById(id);
    if (!found) throw new Error(`Elemento nao encontrado: ${id}`);
    return found;
}

function isSelected(state, entity) {
    const selected = state.selectedRef;
    return selected?.type === entity.type && selected.index === entity.index;
}

function typeLabel(type) {
    return TYPE_LABELS[type] ?? type;
}

function field(entity, key, label, type = "text", options = null) {
    const value = entity.ref[key];
    let input = "";

    if (type === "bool") {
        input = `<select data-k="${key}" data-type="bool"><option value="true" ${value === true ? "selected" : ""}>true</option><option value="false" ${value === false ? "selected" : ""}>false</option></select>`;
    } else if (type === "select" && options) {
        const values = options.includes(String(value)) ? options : [String(value), ...options];
        input = `<select data-k="${key}">${values.map(option => `<option value="${escapeHtml(option)}" ${String(value) === String(option) ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
    } else {
        const inputType = type === "number" ? "number" : "text";
        input = `<input data-k="${key}" data-type="${type}" type="${inputType}" value="${escapeHtml(value ?? "")}">`;
    }

    return `<div class="field"><label>${escapeHtml(label)}</label>${input}</div>`;
}

function refNameField(entity, options) {
    const value = entity.ref.spriteRef ?? entity.ref.animationRef ?? "";
    const values = options.includes(String(value)) ? options : [String(value), ...options];
    const choices = values
        .filter(Boolean)
        .map(option => `<option value="${escapeHtml(option)}" ${String(value) === String(option) ? "selected" : ""}>${escapeHtml(option)}</option>`)
        .join("");
    return `<div class="field full"><label>spriteRef / animationRef</label><select data-k="refName">${choices}</select></div>`;
}

function playerField(doc, key, label, value, step = null) {
    const stepAttr = step ? ` step="${step}"` : "";
    return `<div class="field"><label>${escapeHtml(label)}</label><input data-doc="${doc}" data-k="${key}" type="number"${stepAttr} value="${escapeHtml(value)}"></div>`;
}
