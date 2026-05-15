export class CanvasInteractions {
    constructor({ canvas, state, renderer, onChange }) {
        this.canvas = canvas;
        this.state = state;
        this.renderer = renderer;
        this.onChange = onChange;
        this.bind();
    }

    bind() {
        this.canvas.onmousedown = event => this.handleMouseDown(event);
        this.canvas.onmousemove = event => this.handleMouseMove(event);
        this.canvas.onmouseup = () => this.endDrag();
        this.canvas.onmouseleave = () => this.endDrag();
        this.canvas.onwheel = event => this.handleWheel(event);
    }

    handleMouseDown(event) {
        const mouse = this.mouseFromEvent(event);
        this.state.mouse = mouse;

        if (event.shiftKey || event.button === 1) {
            this.state.drag = {
                kind: "camera",
                startX: mouse.x,
                startY: mouse.y,
                cameraX: this.state.camera.x,
                cameraY: this.state.camera.y,
            };
            return;
        }

        const hit = this.renderer.hitTest(mouse.x, mouse.y);
        if (!hit) {
            this.state.clearSelection();
            this.onChange();
            return;
        }

        this.state.select(hit.type, hit.index);
        const selected = this.state.selected();
        this.state.drag = {
            kind: "move",
            type: selected.type,
            index: selected.index,
            offsetX: mouse.wx - (selected.ref.x ?? 0),
            offsetY: mouse.wy - (selected.ref.y ?? 0),
        };
        this.onChange();
    }

    handleMouseMove(event) {
        const mouse = this.mouseFromEvent(event);
        this.state.mouse = mouse;

        if (this.state.drag) {
            if (this.state.drag.kind === "camera") {
                this.state.camera.x = this.state.drag.cameraX - (mouse.x - this.state.drag.startX) / this.state.camera.zoom;
                this.state.camera.y = this.state.drag.cameraY - (mouse.y - this.state.drag.startY) / this.state.camera.zoom;
            } else {
                const selected = this.state.selected();
                if (selected) {
                    selected.ref.x = this.state.snapWorld(mouse.wx - this.state.drag.offsetX);
                    selected.ref.y = this.state.snapWorld(mouse.wy - this.state.drag.offsetY);
                }
            }

            this.onChange();
            return;
        }

        this.renderer.draw();
    }

    handleWheel(event) {
        event.preventDefault();
        const oldZoom = this.state.camera.zoom;
        const factor = event.deltaY < 0 ? 1.1 : 0.9;
        const mouse = this.mouseFromEvent(event);
        const before = {
            x: mouse.x / oldZoom + this.state.camera.x,
            y: mouse.y / oldZoom + this.state.camera.y,
        };

        this.state.camera.zoom = Math.max(0.2, Math.min(3, this.state.camera.zoom * factor));
        this.state.camera.x = before.x - mouse.x / this.state.camera.zoom;
        this.state.camera.y = before.y - mouse.y / this.state.camera.zoom;
        this.onChange();
    }

    endDrag() {
        this.state.drag = null;
    }

    mouseFromEvent(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return {
            x,
            y,
            wx: this.renderer.worldX(x),
            wy: this.renderer.worldY(y),
        };
    }
}
