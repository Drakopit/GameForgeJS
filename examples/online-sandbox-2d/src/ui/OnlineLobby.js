const PANEL_WIDTH = 440;
const PANEL_HEIGHT = 460;
const COMPACT_HEIGHT = 500;
const KEYBOARD_HEIGHT = 330;

/** Lobby layouts for portrait, short landscape and an open software keyboard. */
export class OnlineLobby {
    constructor(ui) { this.ui = ui; }

    Draw(width, height) {
        const ui = this.ui, frame = ui.frame, session = ui.level.session;
        const panelWidth = Math.min(PANEL_WIDTH, width - 32);
        const x = (width - panelWidth) / 2;
        const compact = height < COMPACT_HEIGHT;
        const wide = compact && width >= 640;
        const active = Object.entries(ui.fields).find(([id, field]) => id !== 'chat' && field.isActive);
        const keyboard = height < KEYBOARD_HEIGHT && active;
        const layoutWidth = wide && !keyboard ? Math.min(640, width - 32) : panelWidth;
        const left = (width - layoutWidth) / 2;
        const panelHeight = Math.min(wide ? 306 : PANEL_HEIGHT, height - 24);
        const y = Math.max(12, (height - panelHeight) / 2);
        frame.Panel({ x: left, y, width: layoutWidth, height: panelHeight });
        frame.Text('SKYBOUND • TOGETHER', left + 20, y + 32, { size: compact ? 20 : 23, color: '#ffe6a0', weight: 700 });
        if (keyboard) {
            const [id] = active;
            ui.Field(id, x + 20, y + 46, panelWidth - 40);
            if (panelHeight >= 155) ui.LayoutButton('done', 'Done', x + 20, y + panelHeight - 56, panelWidth - 40);
            return;
        }
        frame.Text('Explore, build a bridge, restore the beacon.', left + 20, y + (compact ? 54 : 67),
            { size: 13, maxWidth: layoutWidth - 40 });
        const buttonsY = wide ? Math.min(212, panelHeight - 56) : compact ? 270 : 326;
        const serverY = wide ? Math.min(150, buttonsY - 56) : compact ? 208 : 262;
        const nameY = wide ? Math.min(80, serverY - 66) : compact ? 80 : 110;
        const roomY = wide ? nameY : compact ? 144 : 186;
        const fieldWidth = wide ? (layoutWidth - 56) / 2 : layoutWidth - 40;
        const roomX = wide ? left + layoutWidth / 2 + 8 : left + 20;
        frame.Text('NAME', left + 20, y + nameY - 10);
        ui.Field('name', left + 20, y + nameY, fieldWidth);
        frame.Text('ROOM CODE · empty to create', roomX, y + roomY - 10);
        ui.Field('room', roomX, y + roomY, fieldWidth);
        frame.Text('DEDICATED SERVER', left + 20, y + serverY - 10);
        ui.Field('server', left + 20, y + serverY, layoutWidth - 40);
        ui.LayoutButton('create', session.status === 'connecting' ? 'Connecting…' : 'Create room', left + 20, y + buttonsY, (layoutWidth - 50) / 2, ui.selection === 0);
        ui.LayoutButton('join', 'Join friend', left + layoutWidth / 2 + 5, y + buttonsY, (layoutWidth - 50) / 2, ui.selection === 1);
        const status = session.message || (session.status === 'connecting' ? 'Connecting…' : 'Gamepad: D-pad to choose · A to confirm');
        if (!wide || panelHeight >= 300) {
            frame.Text(status, left + 20, y + (wide ? 278 : compact ? 340 : 400),
                { size: 12, color: '#b8d9df', maxWidth: layoutWidth - 40 });
        }
        if (!compact) frame.Text('Online server ready · create a room to play.', left + 20, y + 429, { size: 12 });
    }
}
