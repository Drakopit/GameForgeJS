import { loadImages } from "./asset-loader.js";
import { BuildAtlasManifest } from "./atlas-mapper.js";
import { AssetCatalog } from "./catalog.js";
import { DEFAULT_PROFILE_ID, EDITOR_PROFILES } from "./config.js";
import { loadEditorData } from "./data-source.js";
import { EditorState } from "./editor-state.js";
import { CanvasInteractions } from "./interactions.js";
import { WorldRenderer } from "./renderer.js";
import { EditorUI, element } from "./ui.js";
import { copyJson, downloadJson } from "./utils.js";

const state = new EditorState();
let catalog = new AssetCatalog();
let renderer = null;
let ui = null;

bootstrap().catch(error => {
    console.error(error);
    const status = document.getElementById("status");
    if (status) status.textContent = `Erro: ${error.message}`;
});

async function bootstrap() {
    const canvas = element("canvas");
    const wrap = element("canvasWrap");
    const hud = element("hud");
    const initialProfile = EDITOR_PROFILES[DEFAULT_PROFILE_ID];
    const initialData = await loadEditorData(initialProfile.defaultPhaseId, { profileId: initialProfile.id });

    catalog = new AssetCatalog(initialData.snow);
    state.loadPhase(initialData.phaseId, initialData);
    state.images = loadImages(() => renderer?.draw(), initialData.profile.imageMap);

    renderer = new WorldRenderer({ canvas, wrap, hud, state, catalog });
    ui = new EditorUI({ state, catalog });
    ui.onSelectionChange = () => renderer.draw();
    ui.fillProfiles();
    ui.fillPhaseOptions(initialData.profileId);

    bindToolbar();
    new CanvasInteractions({ canvas, state, renderer, onChange: renderAll });

    ui.fillCatalog();
    renderer.resize();
    renderAll();
    ui.setStatus(`Fase carregada: ${initialData.phase.label}`);
}

function bindToolbar() {
    document.querySelectorAll("[data-mode]").forEach(button => {
        button.onclick = () => {
            document.querySelectorAll("[data-mode]").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            state.mode = button.dataset.mode;
            state.clearSelection();
            renderAll();
        };
    });

    document.querySelectorAll("[data-filter]").forEach(button => {
        button.onclick = () => {
            document.querySelectorAll("[data-filter]").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            state.filter = button.dataset.filter;
            renderAll();
        };
    });

    element("loadPhaseBtn").onclick = loadSelectedPhase;
    element("phaseSelect").onchange = () => ui.syncManifestFields(ui.currentPhaseConfig());
    element("manifestProfileSelect").onchange = () => ui.fillPhaseOptions(element("manifestProfileSelect").value);
    element("addPlatformBtn").onclick = () => mutate(() => state.addPlatform());
    element("addObjectBtn").onclick = () => mutate(() => state.addObject(ui.selectedCatalogItem()));
    element("addEnemyBtn").onclick = () => mutate(() => state.addEnemy());
    element("addParallaxBtn").onclick = () => mutate(() => state.addParallax());
    element("loadAtlasImageBtn").onclick = loadAtlasImage;
    element("generateAtlasCatalogBtn").onclick = generateAtlasCatalog;
    element("deleteBtn").onclick = deleteSelected;
    element("duplicateBtn").onclick = () => mutate(() => state.duplicateSelected());
    element("exportStageBtn").onclick = () => downloadJson(state.stageFileName(), state.stage);
    element("exportEnemiesBtn").onclick = () => downloadJson(state.enemiesFileName(), state.enemies);
    element("exportPlayerBtn").onclick = () => downloadJson("player.json", state.player);
    element("downloadActiveBtn").onclick = () => downloadJson(ui.activeDownloadName(), state.activeDocument(ui.activeJsonKey()));
    element("copyActiveBtn").onclick = copyActiveJson;
    element("jsonSelect").onchange = () => ui.updateJson();
    element("applyJsonBtn").onclick = applyJson;
    element("importInput").onchange = event => importFiles(event.target.files);
    element("snapInput").oninput = event => {
        state.snap = Math.max(1, Number(event.target.value) || 1);
    };
    element("zoomInput").oninput = event => {
        state.camera.zoom = Number(event.target.value) || 0.85;
        renderAll();
    };

    window.onresize = () => renderer.resize();
    document.onkeydown = event => {
        if (event.key === "Delete") deleteSelected();
        if (event.ctrlKey && event.key.toLowerCase() === "d") {
            event.preventDefault();
            mutate(() => state.duplicateSelected());
        }
    };
}

function loadAtlasImage() {
    const name = element("atlasImageNameInput").value.trim();
    const path = element("atlasImagePathInput").value.trim();
    if (!name || !path) {
        ui.setStatus("Informe nome e caminho da imagem.");
        return;
    }

    const image = new Image();
    image.onload = () => {
        renderAll();
        ui.setStatus(`Imagem carregada: ${name}`);
    };
    image.onerror = () => ui.setStatus(`Falha ao carregar imagem: ${path}`);
    image.src = path;
    state.images[name] = image;
}

function generateAtlasCatalog() {
    const imageName = element("atlasImageNameInput").value.trim();
    if (!imageName) {
        ui.setStatus("Informe o nome da imagem antes de gerar o catalogo.");
        return;
    }

    const doc = BuildAtlasManifest({
        imageName,
        prefix: element("atlasPrefixInput").value.trim() || "tile",
        tileWidth: Math.max(1, Number(element("atlasTileWidthInput").value) || 64),
        tileHeight: Math.max(1, Number(element("atlasTileHeightInput").value) || 64),
        columns: Math.max(1, Number(element("atlasColumnsInput").value) || 1),
        rows: Math.max(1, Number(element("atlasRowsInput").value) || 1),
        kind: element("atlasKindSelect").value,
    });

    catalog.rebuild({
        ...(catalog.snowData ?? {}),
        [`generated_${imageName}`]: doc,
    });
    element("atlasOutputBox").value = JSON.stringify(doc, null, 2);
    ui.fillCatalog();
    renderAll();
    ui.setStatus(`Catalogo gerado para ${imageName}.`);
}

async function loadSelectedPhase() {
    const phaseId = element("phaseSelect").value;
    const phaseConfig = ui.currentPhaseConfig();
    const data = await loadEditorData(phaseId, ui.manifestRequest(phaseConfig));
    catalog.rebuild(data.snow);
    state.loadPhase(data.phaseId, data);
    state.images = loadImages(() => renderer?.draw(), data.profile.imageMap);
    ui.fillCatalog();
    renderAll();
    ui.setStatus(`Fase carregada: ${data.phase.label}`);
}

async function importFiles(files) {
    const imported = [];

    for (const file of [...files]) {
        try {
            const object = JSON.parse(await file.text());
            const lower = file.name.toLowerCase();

            if (object.platforms || object.parallax || lower.includes("stage")) {
                state.setActiveDocument("stage", object);
                imported.push(`stage: ${file.name}`);
            } else if (object.enemies || object.enemyDefaults || lower.includes("enem")) {
                state.setActiveDocument("enemies", object);
                imported.push(`enemies: ${file.name}`);
            } else if (object.player || lower.includes("player")) {
                state.setActiveDocument("player", object);
                imported.push(`player: ${file.name}`);
            } else {
                imported.push(`ignorado: ${file.name}`);
            }
        } catch (error) {
            alert(`Erro lendo ${file.name}: ${error.message}`);
        }
    }

    renderAll();
    ui.setStatus(`Importados ${imported.length} arquivo(s): ${imported.join(" | ")}`);
}

function deleteSelected() {
    const selected = state.selected();
    if (selected?.type === "player") {
        alert("O spawn do player nao deve ser removido; altere x/y.");
        return;
    }

    mutate(() => state.removeSelected());
}

function applyJson() {
    try {
        ui.applyJsonFromEditor();
        renderAll();
        ui.setStatus("JSON aplicado");
    } catch (error) {
        alert(`JSON invalido: ${error.message}`);
    }
}

async function copyActiveJson() {
    try {
        await copyJson(state.activeDocument(ui.activeJsonKey()));
        ui.setStatus("JSON copiado");
    } catch (error) {
        ui.setStatus(`Falha ao copiar: ${error.message}`);
    }
}

function mutate(action) {
    action();
    renderAll();
}

function renderAll() {
    ui.renderAll(() => renderAll());
    renderer.draw();
}
