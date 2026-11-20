import { Vector2D } from 'gameforgejs/core';

export function Aim(from, to) { return to.Subtract(from).Normalize(); }
export function CircleHit(a, radiusA, b, radiusB) { return a.DistanceTo(b) < radiusA + radiusB; }
export function KeepInArena(position, rules, radius) {
    return new Vector2D(Math.max(rules.padding + radius, Math.min(rules.width - rules.padding - radius, position.x)),
        Math.max(rules.padding + radius, Math.min(rules.height - rules.padding - radius, position.y)));
}
