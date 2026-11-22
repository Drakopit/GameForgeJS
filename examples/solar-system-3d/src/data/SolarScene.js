import { SceneDocument } from 'gameforgejs/core';

/**
 * Reads the solar system from scenes/solar-system.gfscene.json.
 * Each planet starts on +X: its X position is the orbit radius, its scale the
 * planet radius and rotation Z the axial tilt. Colours, clouds, atmosphere,
 * seed and texture are its celestial Material; `Orbit` holds speed, spin,
 * inclination and rings. The `sun` node gives the sun's size and material.
 * @param {Object} document - Parsed scene JSON.
 * @returns {{camera: Object, lights: Object[], sun: {scale: number, material: Object}, planets: Object[]}}
 */
export function SolarFromScene(document) {
    const scene = new SceneDocument(document);
    const sun = scene.Node('sun');
    const { type: _sunType, ...sunMaterial } = scene.Component(sun, 'Material');
    return {
        camera: scene.settings.camera,
        lights: scene.Lights(),
        sun: { scale: sun.transform.scale[0], material: sunMaterial },
        planets: scene.Nodes({ layer: 'planets' }).map(node => {
            const material = scene.Component(node, 'Material');
            const planet = {
                name: node.name,
                radius: node.transform.scale[0],
                orbit: scene.WorldPosition(node)[0],
                ...scene.Component(node, 'Orbit'),
                tilt: node.transform.rotation[2],
                colors: [material.baseColor, material.secondaryColor],
            };
            if (material.atmosphereColor !== undefined) planet.atmosphere = material.atmosphereColor;
            if (material.cloudStrength !== undefined) planet.cloud = material.cloudStrength;
            planet.seed = material.seed;
            if (material.albedoMap !== undefined) planet.textureMap = material.albedoMap;
            return planet;
        }),
    };
}
