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
        let deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        
        // Cap deltaTime to prevent huge values on first frame or after pauses
        if (deltaTime > 0.1) { // Cap at 100ms
            deltaTime = 0.016; // Use ~60fps fallback
        }
        
        // console.log("GameLoop: _loop called at currentTime:", currentTime, "lastTime:", this.lastTime);
        
        if (this.world && typeof this.world.update === 'function') {
            this.world.update(deltaTime);
        } else {
            console.error("GameLoop: world or world.update is not available or not a function.");
        }

        if (this.renderer && typeof this.renderer.render === 'function') {
            this.renderer.render(this.world);
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
