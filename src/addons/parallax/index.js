import { AssetManager } from '../../core/Assets/AssetManager.js';

const DEFAULTS = Object.freeze({
    x: 0, y: 0, scale: 1, scrollRatioX: 0, scrollRatioY: 0,
    repeatX: true, repeatY: false, opacity: 1, speedX: 0, speedY: 0,
});

/**
 * Repeating image layer drawn through an existing Screen. Owns only its offsets.
 * Supply an image or assets service; shared bootstrap assets remain the default.
 * The caller drives hooks and owns the screen, camera and image lifetime.
 */
export class ParallaxLayer2D {
    constructor(screen, config = {}, { image, assets = AssetManager.instance } = {}) {
        this.screen = screen;
        this.config = { ...DEFAULTS, ...config };
        this.image = image ?? assets?.GetImage(this.config.sprite);
        this.offsetX = 0;
        this.offsetY = 0;
        for (const key of ['x', 'y', 'scale', 'scrollRatioX', 'scrollRatioY', 'opacity', 'speedX', 'speedY']) {
            if (!Number.isFinite(this.config[key])) throw new TypeError(`Parallax ${key} must be finite.`);
        }
        if (this.config.scale <= 0) throw new RangeError('Parallax scale must be positive.');
    }
    OnUpdate(dt = 0.016) {
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Parallax delta time must be finite and nonnegative.');
        this.offsetX += this.config.speedX * dt;
        this.offsetY += this.config.speedY * dt;
    }
    OnDrawn(camera = null) {
        if (!this.image || !this.screen?.Context) return;
        const width = this.config.width ?? this.image.width * this.config.scale;
        const height = this.config.height ?? this.image.height * this.config.scale;
        if (![width, height].every(value => Number.isFinite(value) && value > 0)) throw new RangeError('Parallax image dimensions must be finite and positive.');
        const baseX = this.config.x - (camera?.position?.x ?? 0) * this.config.scrollRatioX + this.offsetX;
        const baseY = this.config.y - (camera?.position?.y ?? 0) * this.config.scrollRatioY + this.offsetY;
        if (![baseX, baseY].every(Number.isFinite)) throw new RangeError('Parallax camera position must be finite.');
        const startX = this.config.repeatX ? this.RepeatStart(baseX, width) : baseX;
        const startY = this.config.repeatY ? this.RepeatStart(baseY, height) : baseY;
        const endX = this.config.repeatX ? this.screen.width + width : startX + width;
        const endY = this.config.repeatY ? this.screen.height + height : startY + height;
        const ctx = this.screen.Context;
        ctx.save();
        try {
            ctx.globalAlpha = Math.max(0, Math.min(1, this.config.opacity));
            for (let y = startY; y < endY; y += height) {
                for (let x = startX; x < endX; x += width) ctx.drawImage(this.image, x, y, width, height);
            }
        } finally { ctx.restore(); }
    }
    RepeatStart(value, size) {
        const mod = value % size;
        return mod > 0 ? mod - size : mod;
    }
    Dispose() { this.screen = null; this.image = null; }
}
