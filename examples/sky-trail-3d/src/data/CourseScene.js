import { SceneDocument } from 'gameforgejs/core';

const round = value => Math.round(value * 1e6) / 1e6;
const subtract = (left, right) => left.map((value, index) => round(value - (right?.[index] ?? 0)));
const clone = value => JSON.parse(JSON.stringify(value));

/**
 * Rebuilds a Sky Trail course document from its gameforgejs.scene file
 * (assets/Scenes/sky-trail/*.gfscene.json).
 *
 * Gameplay settings live in `settings.course`; the nodes hold everything
 * spatial: platforms (`Platform` component), coins (`Coin.platformId`, offset =
 * position - platform position), the player spawn, the goal trigger (ring
 * position minus `goal.ring.offset`), goal pole/flag and the four lights
 * (the goal light's offset is its position minus the goal trigger).
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Course document in the shape `LoadSkyTrailCourse` reads.
 */
export function CourseDocumentFromScene(document) {
    const scene = new SceneDocument(document);
    const settings = scene.settings;
    const course = clone(settings.course ?? {});
    const node = id => scene.Node(id);
    const position = target => scene.WorldPosition(target);
    const light = id => {
        const { type, ...values } = scene.Component(node(id), 'Light');
        return values;
    };

    course.name = scene.name;
    course.backgroundColor = clone(settings.backgroundColor);
    course.camera = { ...course.camera, ...clone(settings.camera ?? {}) };

    const platforms = scene.Nodes({ layer: 'platforms' }).map(platform => ({
        ...scene.Component(platform, 'Platform'),
        position: position(platform),
        size: [...(platform.transform?.scale ?? [1, 1, 1])],
        color: clone(scene.Component(platform, 'Material').albedoColor),
    }));
    course.platforms = platforms;

    const player = node('player');
    course.player = { ...course.player, spawn: position(player) };
    if (course.player.scale === '$node') course.player.scale = player.transform?.scale?.[0] ?? 1;

    const trigger = subtract(position(node('goal_trigger')), course.goal?.ring?.offset ?? [0, 0, 0]);
    course.goal = { ...course.goal, trigger };
    for (const part of ['pole', 'flag']) {
        const target = node(`goal_${part}`);
        course.goal[part] = { ...scene.Component(target, 'GoalPart'), position: position(target), scale: [...(target.transform?.scale ?? [1, 1, 1])] };
    }

    course.lighting = {
        ...course.lighting,
        ambient: light('light_ambient'),
        hemisphere: light('light_sky'),
        sun: light('light_sun'),
        goalLight: { ...light('light_goal'), offset: subtract(position(node('light_goal')), trigger) },
    };

    const byId = new Map(platforms.map(platform => [platform.id, platform]));
    course.coins = {
        ...course.coins,
        items: scene.Nodes({ layer: 'coins' }).map(coin => {
            const { platformId, ...values } = scene.Component(coin, 'Coin');
            return { offset: subtract(position(coin), byId.get(platformId)?.position), platformId, ...values };
        }),
    };
    return course;
}
