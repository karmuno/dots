// Import necessary classes
import GameLoop from './GameEngine/Core/GameLoop.js';
import World from './GameEngine/Core/World.js';
import RenderSystem from './GameEngine/Systems/RenderSystem.js';
import WorldView from './GameEngine/UI/WorldView.js';

// Initial console log to confirm script start
console.log("main.js loaded.");

// Wait for the DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    try {
        // Instantiate the world
        const world = new World();
        console.log("World instantiated:", world);

        // Create WorldView instance
        const worldView = new WorldView(800, 600);
        console.log("WorldView instantiated:", worldView);

        // Add Camera Controls
        worldView.getCanvas().addEventListener('wheel', function(event) {
            event.preventDefault();
            const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; // Zoom in or out
            // Get mouse position relative to the canvas
            const rect = worldView.getCanvas().getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            worldView.zoomCamera(zoomFactor, mouseX, mouseY);
        }, { passive: false });

        let isPanning = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        worldView.getCanvas().addEventListener('mousedown', function(event) {
            if (event.button === 0) { // Left mouse button
                isPanning = true;
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
            }
        });

        worldView.getCanvas().addEventListener('mousemove', function(event) {
            if (isPanning) {
                const dx = event.clientX - lastMouseX;
                const dy = event.clientY - lastMouseY;
                worldView.panCamera(-dx, -dy); // Pan in the opposite direction of mouse movement
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
            }
        });

        worldView.getCanvas().addEventListener('mouseup', function(event) {
            if (event.button === 0) {
                isPanning = false;
            }
        });

        worldView.getCanvas().addEventListener('mouseleave', function() {
            isPanning = false; // Stop panning if mouse leaves canvas
        });

        worldView.getCanvas().addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });

        // Instantiate the render system
        const renderSystem = new RenderSystem(worldView);
        console.log("RenderSystem instantiated:", renderSystem);
        
        // Add render system to the world's systems
        // Assuming World has an addSystem method
        if (typeof world.addSystem === 'function') {
            world.addSystem(renderSystem);
            console.log("RenderSystem added to world.");
        } else {
            console.error("World.addSystem is not a function. RenderSystem not added.");
        }

        // Instantiate the game loop with the world and renderer
        // The GameLoop constructor expects 'world' and 'renderer' (which is our renderSystem)
        const gameLoop = new GameLoop(world, renderSystem);
        console.log("GameLoop instantiated:", gameLoop);

        // Start the game loop
        if (typeof gameLoop.start === 'function') {
            gameLoop.start();
            console.log("Game loop started.");
        } else {
            console.error("GameLoop.start is not a function. Game loop not started.");
        }

    } catch (error) {
        console.error("Error initializing game:", error);
    }
});
