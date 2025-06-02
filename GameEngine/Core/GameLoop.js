class GameLoop {
    constructor(world, renderer) {
        this.world = world;
        this.renderer = renderer;
        this.animationFrameId = null;
        this.lastTime = 0;
        this._loop = this._loop.bind(this); // Bind _loop to this context
    }

    start() {
        this.lastTime = performance.now();
        console.log("GameLoop: Starting loop, lastTime initialized:", this.lastTime);
        this.animationFrameId = requestAnimationFrame(this._loop);
    }

    _loop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        // console.log("GameLoop: _loop called at currentTime:", currentTime, "lastTime:", this.lastTime);
        
        if (this.world && typeof this.world.update === 'function') {
            this.world.update(deltaTime);
            console.log("GameLoop: world.update called with deltaTime:", deltaTime);
        } else {
            console.error("GameLoop: world or world.update is not available or not a function.");
        }

        if (this.renderer && typeof this.renderer.render === 'function') {
            this.renderer.render(this.world);
            console.log("GameLoop: renderer.render called");
        } else {
            console.error("GameLoop: renderer or renderer.render is not available or not a function.");
        }

        this.lastTime = currentTime;
        this.animationFrameId = requestAnimationFrame(this._loop);
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log("GameLoop stopped.");
        } else {
            console.log("GameLoop: No active loop to stop.");
        }
    }
}

export default GameLoop;
