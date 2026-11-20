import { Component, Vector2D, ActionManager, Input, Touch, MathExt } from 'gameforgejs/core';

export class RouteNavigator extends Component {
    constructor(level) {
        super(); this.level = level; this.position = Vector2D.FromObject(level.progress.nodes.get(level.progress.current));
        this.destination = null; this.elapsed = 0; this.cooldown = 0;
    }
    Travel(id) {
        const progress = this.level.progress;
        if (this.destination || this.level.mode !== 'map' || !progress.Neighbors(progress.current).includes(id)) return false;
        this.from = this.position.Clone(); this.destination = id; this.elapsed = 0; this.level.sound.Play('select'); return true;
    }
    OnUpdate(dt) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        if (this.level.mode !== 'map') return;
        if (this.destination) {
            this.elapsed += dt;
            const t = Math.min(1, this.elapsed / this.level.rules.travelSeconds), ease = t * t * (3 - 2 * t);
            const target = this.level.progress.nodes.get(this.destination);
            this.position.Set(MathExt.Lerp(this.from.x, target.x, ease), MathExt.Lerp(this.from.y, target.y, ease));
            if (t === 1) { this.level.progress.current = this.destination; this.destination = null; }
            return;
        }
        if (ActionManager.IsActionDown('ACTION')) this.level.EnterStage();
        const direction = this.level.hud.Direction();
        if (this.cooldown === 0 && direction.Length() > 0.5) {
            const current = this.position, axis = direction.Normalize();
            const choices = this.level.progress.Neighbors(this.level.progress.current).map(id => {
                const delta = Vector2D.FromObject(this.level.progress.nodes.get(id)).Subtract(current).Normalize();
                return {id, score: delta.x * axis.x + delta.y * axis.y};
            }).filter(choice => choice.score > 0.35).sort((a, b) => b.score - a.score);
            if (choices.length) this.Travel(choices[0].id);
            this.cooldown = 0.24;
        }
        const input = Input.instance, points = (input?.touch?.GetStartedTouches() ?? []).map(contact => contact.startPosition);
        if (input?.mouse?.buttonsDown[0]) points.push(input.mouse.position);
        for (const client of points) {
            const screen = Touch.ToScreen(client, this.level.screen);
            if (screen.y < 95 || screen.y > this.level.screen.Height - 150) continue;
            const world = this.level.view.ToWorld(screen);
            const radius = Math.max(34, 24 / this.level.view.Layout().scale);
            const node = [...this.level.progress.nodes.values()].map(node => ({node, distance: Vector2D.FromObject(node).DistanceTo(world)}))
                .filter(item => item.distance < radius).sort((a, b) => a.distance - b.distance)[0]?.node;
            if (node?.id === this.level.progress.current) this.level.EnterStage();
            else if (node) this.Travel(node.id);
        }
    }
}
