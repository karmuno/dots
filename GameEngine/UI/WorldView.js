import Camera from '../Core/Camera.js'; // Added
import FollowCam from '../Core/FollowCam.js';

class WorldView {
    constructor(world, width, height) {
        this.world = world; // Store world
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'mainGameCanvas'; // Assign ID to main canvas
        this.canvas.width = width;
        this.canvas.height = height;
        const uiContainer = document.getElementById('uiContainer');
        uiContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.camera = new Camera(this.canvas); // Added - passing canvas

        // Follow Cam Canvas
        this.followCamCanvas = document.createElement('canvas');
        this.followCamCanvas.id = 'followCamCanvas';
        this.followCamCanvas.width = 150; // Example size, make configurable later
        this.followCamCanvas.height = 150; // Example size, make configurable later
        // TODO: Consider a dedicated container or better positioning for this canvas
        uiContainer.appendChild(this.followCamCanvas);
        this.followCamContext = this.followCamCanvas.getContext('2d');

        // Calculate zoom for FollowCam to make ~25 screen pixels correspond to a typical dot's world radius
        const typicalDotWorldRadius = 1.5; // Default Dot spriteSize is { width: 3, height: 3 }, so radius is 1.5
        const targetScreenRadius = 25; // We want the dot to appear with a 25px radius on the FollowCam
        const calculatedZoom = targetScreenRadius / typicalDotWorldRadius;

        this.followCam = new FollowCam(this.followCamCanvas, null, calculatedZoom);
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

    getFollowCam() {
        return this.followCam;
    }

    getFollowCamContext() {
        return this.followCamContext;
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
