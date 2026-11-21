import { Vector3D } from 'gameforgejs/core';
import { WarpSettings } from '../data/WarpSettings.js';
import { HUDFrame, InputHelpPanel } from 'gameforgejs/2d';
import { AreaAnnouncement } from './AreaAnnouncement.js';
import { HealthBar } from './HealthBar.js';

const Layout = Object.freeze({
    player: { x: 16, y: 16, width: 300, height: 96 },
    health: { x: 92, y: 59, width: 204, height: 15 },
    objective: { width: 230, height: 83, margin: 16 },
    map: { width: 162, height: 132, margin: 16, y: 112, padding: 10, titleHeight: 28, markerSize: 4, playerRadius: 3 },
    help: { x: 165, y: 175, width: 630, height: 320 },
});

export class ToonRoomHUD {
    get helpVisible() {return this.helpView?.visible ?? this._helpVisible ?? false;}
    set helpVisible(value) {this._helpVisible=value;if(this.helpView)this.helpView.visible=value;}
    constructor(ui) {
        this.draw = ui.Draw;
        this.frame = new HUDFrame(this.draw);
        this.helpVisible = false;
        this.helpView = new InputHelpPanel(this.draw,{title:"Toon Adventure / Controls"});
        this.travelRemaining = 0;
        this.healthBar = new HealthBar(this.frame, Layout.health);
        this.announcement = new AreaAnnouncement(this.draw);
    }

    ClearTravel() { this.travelRemaining = 0; }
    ShowArea(name) { this.announcement.Show(name); }
    ShowTravel(name) { this.travelName = name; this.travelRemaining = WarpSettings.noticeSeconds; this.ShowArea(name); }
    OnUpdate(dt, areaName) {
        this.travelRemaining = Math.max(0, this.travelRemaining - dt);
        this.announcement.OnUpdate(dt, areaName);
    }
    ToggleHelp() { this.helpVisible = !this.helpVisible; }

    Draw(level) {
        const frame = this.frame;
        frame.Panel(Layout.player);
        frame.Badge('EX', 29, 31, 48);
        frame.Text('EXPLORER', 92, 40, { size: 15, weight: 700, color: frame.theme.gold });
        frame.Text('Guardião da trilha', 92, 53, { size: 10, color: frame.theme.muted });
        this.healthBar.Draw(level.player.health);
        frame.Text(`HP   ${level.player.attack.phase.toUpperCase()}`, 92, 94, { size: 11, color: frame.theme.muted });
        const right = level.width - Layout.objective.width - Layout.objective.margin;
        frame.Panel({ x: right, y: 16, width: Layout.objective.width, height: Layout.objective.height });
        frame.Text('EXPEDIÇÃO  /  FLORESTA', right + 14, 36, { size: 10, color: frame.theme.gold, weight: 700 });
        frame.Text(`${level.defeatedCount} / ${level.enemies.length} sentinelas`, right + 14, 57, { size: 17, weight: 700 });
        frame.Meter(level.defeatedCount / level.enemies.length, { x: right + 14, y: 70, width: 202, height: 5 }, frame.theme.gold);
        frame.Text(level.areaName, right + 14, 89, { size: 10, color: frame.theme.muted });

        let status = 'Siga a trilha ao norte';
        if (level.defeatedCount === level.enemies.length) status = 'Trilha concluída — explore livremente';
        if (level.player.waterContact.zone) status = 'Água rasa — movimento reduzido';
        if (this.travelRemaining > 0) status = `Portal → ${this.travelName}`;
        if (level.result) status = 'Você caiu. R / Y para recomeçar';
        frame.Panel({ x: 16, y: level.height - 56, width: 480, height: 40 });
        frame.Text(status, 30, level.height - 31, { size: 13, weight: 700 });
        frame.Text('Space / X  ATACAR     H / Start  AJUDA', level.width - 18, level.height - 24,
            { size: 11, color: frame.theme.text, align: 'right' });
        this.DrawWorldMap(level);
        this.announcement.Draw(level.width);
        this.helpView.visible=this.helpVisible;
        if (this.helpVisible) this.DrawHelp();
    }

    DrawWorldMap(level) {
        const frame = this.frame;
        const map = { ...Layout.map, x: level.width - Layout.map.width - Layout.map.margin };
        const plotWidth = map.width - map.padding * 2;
        const plotHeight = map.height - map.titleHeight - map.padding;
        frame.Panel(map);
        frame.Text('LAKES / WARP NETWORK', map.x + map.padding, map.y + map.titleHeight - map.padding, { size: 9, color: frame.theme.gold });
        const bounds = level.physics.bounds;
        const project = position => ({ x: map.x + map.padding + (position.x - bounds.minX) / (bounds.maxX - bounds.minX) * plotWidth,
            y: map.y + map.titleHeight + (position.z - bounds.minZ) / (bounds.maxZ - bounds.minZ) * plotHeight });
        const ctx = frame.context;
        ctx.save();
        for (const lake of level.lakes) {
            const center = Vector3D.FromArray(lake.definition.position);
            const position = project({ x: center.x - lake.definition.width / 2, z: center.z - lake.definition.depth / 2 });
            ctx.fillStyle = lake.definition.color;
            ctx.fillRect(position.x, position.y, lake.definition.width / (bounds.maxX - bounds.minX) * plotWidth, lake.definition.depth / (bounds.maxZ - bounds.minZ) * plotHeight);
        }
        for (const point of level.warpPoints) {
            const position = project(point.position);
            ctx.fillStyle = point.definition.color;
            ctx.fillRect(position.x - map.markerSize / 2, position.y - map.markerSize / 2, map.markerSize, map.markerSize);
        }
        const player = project(Vector3D.FromArray(level.player.transform.position));
        ctx.fillStyle = '#fff4b7';
        ctx.beginPath(); ctx.arc(player.x, player.y, map.playerRadius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    DrawHelp() { this.helpView.visible = true; this.helpView.OnDrawn(); }

    Dispose() {this.helpView.Dispose();}
}
