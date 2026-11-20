import { Config } from 'gameforgejs/core';

/** One authored binding source; missing controls fail before a fight starts. */
export function GetFightingControls() {
    const controls = Config.data?.fighting?.controls;
    for (const name of ['menu', 'playerOne', 'playerTwo', 'system']) {
        if (!controls?.[name]?.gamepad) throw new Error('Missing fighting.controls.' + name + '.gamepad');
    }
    for (const name of ['playerOne', 'playerTwo']) {
        for (const action of ['left', 'right', 'up', 'down', 'light', 'heavy', 'special', 'super']) {
            if (!Array.isArray(controls[name][action]) || !controls[name].gamepad[action]) {
                throw new Error('Missing fighting binding: ' + name + '.' + action);
            }
        }
    }
    if (![0,1].includes(controls.playerOne.gamepad.index) || ![0,1].includes(controls.playerTwo.gamepad.index) || controls.playerOne.gamepad.index===controls.playerTwo.gamepad.index) throw new Error('Fighters require distinct gamepad seats 0 and 1.');
    return controls;
}
