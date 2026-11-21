import { Timeline, Vector3D, MathExt } from 'gameforgejs/core';

/** Parallel camera position, framing and FOV tracks; no timer or render-loop ownership. */
export class ObservatoryTour extends Timeline {
    constructor(level) {
        const duration = level.rules.camera.tourSeconds;
        const start = new Vector3D(-40, 22, 42), middle = new Vector3D(26, 12, 24), end = new Vector3D(3, 8, 18);
        super({duration, tracks: [
            {start: 0, duration: duration / 2, sample: t => {
                const p = Vector3D.Lerp(start, middle, t * t * (3 - 2 * t)); level.camera.SetPosition(p.x, p.y, p.z);
            }},
            {start: duration / 2, duration: duration / 2, sample: t => {
                const p = Vector3D.Lerp(middle, end, t * t * (3 - 2 * t)); level.camera.SetPosition(p.x, p.y, p.z);
            }},
            {start: 0, duration, sample: t => { level.camera.LookAt([0, 5, 0]); level.camera.fov = MathExt.Lerp(65, 42, t); }},
        ], cues: [
            {at: 0, run: () => { level.subtitle = 'AETHER OBSERVATORY'; }},
            {at: duration / 2, run: () => { level.subtitle = 'One engine. Native geometry, light and motion.'; }},
        ], onFinish: () => { level.subtitle = ''; level.jumpQueued = false; }});
    }
}
