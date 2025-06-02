// Import necessary classes
import GameLoop from './GameEngine/Core/GameLoop.js';
import World from './GameEngine/Core/World.js';
import RenderSystem from './GameEngine/Systems/RenderSystem.js';

// Initial console log to confirm script start
console.log("main.js loaded.");

// Wait for the DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    try {
        // Instantiate the world
        const world = new World();
        console.log("World instantiated:", world);

        // Instantiate the render system
        const renderSystem = new RenderSystem();
        console.log("RenderSystem instantiated:", renderSystem);
        
        // Add render system to the world's systems
        // Assuming World has an addSystem method
        if (typeof world.addSystem === 'function') {
            world.addSystem(renderSystem);
            console.log("RenderSystem added to world.");
        } else {
            console.error("World.addSystem is not a function. RenderSystem not added.");
        }

        // Get the canvas element for the renderer (optional for now, but good for future)
        const canvas = document.getElementById('gameCanvas');
        // Pass canvas to RenderSystem if it's designed to use one
        // renderSystem.setCanvas(canvas); // Example

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
