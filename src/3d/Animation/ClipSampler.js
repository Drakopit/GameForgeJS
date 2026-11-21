/** Sample a glTF STEP/LINEAR TRS track, using shortest-path quaternion slerp. */
export function SampleTrack(sampler, path, time) {
    const size = path === 'rotation' ? 4 : 3;
    const times = sampler.input;
    if (!times.length) throw new Error('Animation track has no keyframes.');
    if (!['LINEAR', 'STEP'].includes(sampler.interpolation)) {
        throw new Error(`Unsupported animation interpolation: ${sampler.interpolation}`);
    }
    let low = 0;
    let high = times.length - 1;
    while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (times[middle] <= time) low = middle;
        else high = middle - 1;
    }
    const next = Math.min(low + 1, times.length - 1);
    const a = Array.from(sampler.output.slice(low * size, (low + 1) * size));
    if (sampler.interpolation === 'STEP' || low === next || time <= times[0]) return a;
    const b = Array.from(sampler.output.slice(next * size, (next + 1) * size));
    const t = (time - times[low]) / (times[next] - times[low]);
    if (path !== 'rotation') return a.map((value, index) => value + (b[index] - value) * t);
    return Slerp(a, b, t);
}

function Slerp(a, b, t) {
    let dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
    if (dot < 0) {
        b = b.map(value => -value);
        dot = -dot;
    }
    let result;
    if (dot > 0.9995) result = a.map((value, index) => value + (b[index] - value) * t);
    else {
        const angle = Math.acos(Math.min(1, dot));
        const left = Math.sin((1 - t) * angle) / Math.sin(angle);
        const right = Math.sin(t * angle) / Math.sin(angle);
        result = a.map((value, index) => value * left + b[index] * right);
    }
    const length = Math.hypot(...result);
    return result.map(value => value / length);
}
