class WorldView {
    constructor(width, height) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
    }

    getContext() {
        return this.context;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getCanvas() {
        return this.canvas;
    }

    setImageSmoothing(enabled) {
        this.context.imageSmoothingEnabled = enabled;
        this.context.mozImageSmoothingEnabled = enabled;
        this.context.webkitImageSmoothingEnabled = enabled;
        this.context.msImageSmoothingEnabled = enabled;
    }
}

export default WorldView;
