import { GameObject } from 'gameforgejs/2d';
import { Vector3D } from 'gameforgejs/core';
import { Mesh, PrimitiveMesh, SurfaceMaterial, ToonMaterial, UnlitMaterial } from 'gameforgejs/3d';
import { BattleRules, MapScale } from '../data/BattleRules.js';
/** Actual 3D terraces and world-space range overlays, not a painted isometric grid. */
export class TerrainView extends GameObject {
    constructor(scene, grid) {
        super();
        this.scene = scene;
        this.grid = grid;
        this.meshes = [];
        this.tiles = [];
        const stone = new SurfaceMaterial({ preset: 'stone', albedoColor: '#88775d', scale: 2 });
        this.stone = stone;
        const tops = ['#84a990', '#9cbb91', '#b7c79b'].map(albedoColor => new ToonMaterial({ albedoColor }));
        for (let row = 0; row < grid.rows; row++)
            for (let col = 0; col < grid.cols; col++) {
                const tile = grid.Get(col, row);
                if (!tile)
                    continue;
                const p = this.World(tile), height = p.y;
                this.Box(stone, p.x, height / 2, p.z, MapScale.tile - 0.025, height, MapScale.tile - 0.025);
                this.Box(tops[Math.min(tile.h, 2)], p.x, height + 0.015, p.z, MapScale.tile - 0.045, 0.04, MapScale.tile - 0.045);
                const overlay = new Mesh({ geometry: PrimitiveMesh.Plane(MapScale.tile * 0.92, MapScale.tile * 0.92), material: new UnlitMaterial({ color: [0.1, 0.7, 1, 0.4], transparent: true }), castShadow: false });
                overlay.transform.SetPosition(p.x, p.y + 0.045, p.z);
                scene.Add(overlay);
                this.meshes.push(overlay);
                this.tiles.push({ tile, overlay });
            }
    }
    World(tile) { return new Vector3D((tile.col - (this.grid.cols - 1) / 2) * MapScale.tile, MapScale.base + tile.h * MapScale.elevation, (tile.row - (this.grid.rows - 1) / 2) * MapScale.tile); }
    Box(material, x, y, z, w, h, d) { const mesh = new Mesh({ geometry: PrimitiveMesh.Cube(1), material }); mesh.transform.SetPosition(x, y, z); mesh.transform.SetScale(w, h, d); this.scene.Add(mesh); this.meshes.push(mesh); return mesh; }
    Highlights(turn) {
        const active = turn.active?.stats;
        for (const entry of this.tiles) {
            const { tile, overlay } = entry;
            overlay.visible = false;
            if (turn.phase === 'move' && turn.area.has(this.grid.Key(tile))) {
                overlay.visible = true;
                overlay.material.albedoColor = [0.1, 0.65, 1, 0.45];
            }
            if (turn.phase === 'target' && BattleRules.CanAttack(this.grid, active, { ...tile, hp: 1, team: 'target' }, turn.ability)) {
                overlay.visible = true;
                overlay.material.albedoColor = [1, 0.35, 0.12, 0.4];
                if (turn.Alive().some(p => p.stats.team !== active.team && p.stats.col === tile.col && p.stats.row === tile.row))
                    overlay.material.albedoColor = [1, 0.75, 0.2, 0.65];
            }
            if (turn.cursor?.col === tile.col && turn.cursor?.row === tile.row) {
                overlay.visible = true;
                overlay.material.albedoColor = [1, 0.91, 0.45, 0.65];
            }
        }
    }
    Pick(point, camera, screen) {
        const candidates = [];
        for (const { tile } of this.tiles) {
            const world = this.World(tile), half = MapScale.tile / 2;
            const corners = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, z]) => camera.Project(new Vector3D(world.x + x, world.y + 0.05, world.z + z), screen.Width, screen.Height));
            let sign = 0, inside = true;
            for (let i = 0; i < 4; i++) {
                const a = corners[i], b = corners[(i + 1) % 4], cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
                if (cross !== 0) {
                    if (sign && Math.sign(cross) !== sign)
                        inside = false;
                    sign = Math.sign(cross);
                }
            }
            if (inside && corners.every(p => p.visible))
                candidates.push({ tile, depth: corners[0].depth });
        }
        return candidates.sort((a, b) => a.depth - b.depth)[0]?.tile ?? null;
    }
    OnDestroy() { for (const mesh of this.meshes)
        this.scene.Remove(mesh); super.OnDestroy(); }
}
