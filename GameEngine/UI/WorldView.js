import Camera from '../Core/Camera.js'; // Added

class WorldView {
    constructor(width, height) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.camera = new Camera(this.canvas); // Added - passing canvas
    }

    getContext() {
        return this.context;
    }

    clear() {
        // Clearing now needs to account for transformations if not careful.
        // However, RenderSystem will use save/restore, so this clear should be fine.
        // If we were to clear *after* camera transform, we'd need to clear a much larger area
        // or reset transform before clearing. But RenderSystem handles this.
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getCanvas() {
        return this.canvas;
    }

    // Added getter
    getCamera() {
        return this.camera;
    }

    // Added delegating methods
    panCamera(dx, dy) {
        this.camera.pan(dx, dy);
    }

    zoomCamera(factor, mouseX, mouseY) {
        this.camera.zoomBy(factor, mouseX, mouseY);
    }

    setImageSmoothing(enabled) {
        this.context.imageSmoothingEnabled = enabled;
        this.context.mozImageSmoothingEnabled = enabled;
        this.context.webkitImageSmoothingEnabled = enabled;
        this.context.msImageSmoothingEnabled = enabled;
    }
}

export default WorldView;
