import { SceneDocument } from "gameforgejs/core";
import { ROOM_HEIGHT, ROOM_WIDTH, TILE } from "./AdventureConstants.js";

let rooms = [];

/**
 * Loads the rooms from scenes/rooms.gfscene.json (gameforgejs.scene).
 * Room nodes own their solids, decorations and slimes as children positioned
 * relative to the room's top-left corner.
 * @param {Object} document - Parsed scene JSON from the resource manifest.
 * @returns {Object[]} Rooms in the shape the level and walls expect.
 */
export function LoadRooms(document) {
    const scene = new SceneDocument(document);
    const local = node => {
        const [x, y] = scene.LocalPosition(node);
        return { x, y };
    };
    rooms = scene.Nodes({ layer: "rooms" }).map(node => ({
        id: node.id,
        name: node.name ?? node.id,
        ...scene.Component(node, "Room"),
        solids: scene.Nodes({ layer: "solids", parent: node.id }).map(solid => {
            const [width, height] = scene.Size(solid);
            return { ...local(solid), width, height, ...scene.Component(solid, "Data") };
        }),
        decorations: scene.Nodes({ layer: "decorations", parent: node.id }).map(item => ({ ...scene.Component(item, "Data"), ...local(item) })),
        enemies: scene.Nodes({ layer: "enemies", parent: node.id }).map(item => ({ ...local(item), ...scene.Component(item, "Data") })),
    }));
    return rooms;
}

/**
 * Player start (room id and room-local position) declared in the rooms scene.
 * @param {Object} document - Parsed scene JSON.
 * @returns {{roomId: string, x: number, y: number}}
 */
export function PlayerStart(document) {
    const scene = new SceneDocument(document);
    const marker = scene.Node("player_start");
    const [x, y] = marker ? scene.LocalPosition(marker) : [84, 224];
    return { roomId: marker?.parent ?? scene.settings.startRoom ?? rooms[0]?.id, x, y };
}

export function GetRoomById(roomId) {
    return rooms.find(room => room.id === roomId) ?? null;
}

export function BuildRoomWalls(room) {
    const wall = TILE;
    const walls = [];

    addHorizontalWall(walls, room, "up", 0, wall);
    addHorizontalWall(walls, room, "down", ROOM_HEIGHT - wall, wall);
    addVerticalWall(walls, room, "left", 0, wall);
    addVerticalWall(walls, room, "right", ROOM_WIDTH - wall, wall);

    return walls;
}

function addHorizontalWall(walls, room, direction, y, height) {
    const exit = room.exits?.[direction];
    if (!exit) {
        walls.push({ x: 0, y, width: ROOM_WIDTH, height });
        return;
    }

    walls.push({ x: 0, y, width: exit.min, height });
    walls.push({ x: exit.max, y, width: ROOM_WIDTH - exit.max, height });
}

function addVerticalWall(walls, room, direction, x, width) {
    const exit = room.exits?.[direction];
    if (!exit) {
        walls.push({ x, y: 0, width, height: ROOM_HEIGHT });
        return;
    }

    walls.push({ x, y: 0, width, height: exit.min });
    walls.push({ x, y: exit.max, width, height: ROOM_HEIGHT - exit.max });
}
