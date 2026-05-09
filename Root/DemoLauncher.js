const demos = {
    advanced: "../DemoAdvanced/mainAdvanced.js",
    tactical: "../DemoTacticalRPG/mainTacticalRPG.js",
    demo3d: "../Demo3D/mainDemo3D.js",
    mini3d: "../DemoMiniGame3D/mainMiniGame3D.js",
    immature: "../Demo/mainImmature.js",
};

const params = new URLSearchParams(window.location.search);
const selectedDemo = params.get("demo") ?? "advanced";
const demoPath = demos[selectedDemo] ?? demos.advanced;

import(demoPath).catch(error => {
    console.error(`GameForgeJS: failed to load demo '${selectedDemo}'.`, error);
});
