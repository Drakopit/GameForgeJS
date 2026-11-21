import { Component, Vector2D } from 'gameforgejs/core';

export const rooms = [
    { name: 'The Ember Seal', floor: '#293c48', trim: '#bf9a71', switches: [[240, 260], [720, 350]] },
    { name: 'Cinder Gauntlet', floor: '#452e37', trim: '#cf846d', duration: 12 },
    { name: 'Warden Sanctum', floor: '#353044', trim: '#d5aa72' },
];

export class RoomProgress extends Component {
    constructor(level) { super(); this.level = level; }
    OnFixedUpdate(dt) {
        const level = this.level, room = rooms[level.roomIndex];
        if (level.result || level.boss.active) return;
        const position = level.player.position;
        if (room.switches) {
            room.switches.forEach(([x, y], index) => {
                if (Math.hypot(position.x - x, position.y - y) < 35) level.switches.add(index);
            });
            level.exitOpen = level.switches.size === room.switches.length;
            level.message = 'Activate the two seals. ' + level.switches.size + '/2';
        } else {
            level.roomTime += dt;
            if (Math.floor(level.roomTime / 0.8) !== Math.floor((level.roomTime - dt) / 0.8) && !level.exitOpen) {
                level.hazards.Add(new Vector2D(position.x, position.y));
                level.sound.Play('warning');
            }
            level.exitOpen = level.roomTime >= room.duration;
            level.message = 'Survive the cinders. ' + Math.max(0, Math.ceil(room.duration - level.roomTime)) + 's';
        }
        if (level.exitOpen) {
            level.message = 'Exit unlocked. Enter the north gate.';
            if (Math.hypot(position.x - 480, position.y - 86) < 48) level.EnterRoom(level.roomIndex + 1);
        }
    }
}

