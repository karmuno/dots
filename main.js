// Import necessary classes
import GameLoop from './GameEngine/Core/GameLoop.js';
import World from './GameEngine/Core/World.js';
import RenderSystem from './GameEngine/Systems/RenderSystem.js';
import MovementSystem from './GameEngine/Systems/MovementSystem.js';
import TargetAssignmentSystem from './GameEngine/Systems/TargetAssignmentSystem.js'; // Added import
import CollisionSystem from './GameEngine/Systems/CollisionSystem.js';
import WorldView from './GameEngine/UI/WorldView.js';
import Dot from './GameEngine/Entities/Dot.js';

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
        
        // Instantiate the movement system
        const movementSystem = new MovementSystem();
        console.log("MovementSystem instantiated:", movementSystem);

        // Instantiate the target assignment system
        const targetAssignmentSystem = new TargetAssignmentSystem();
        console.log("TargetAssignmentSystem instantiated:", targetAssignmentSystem);
        
        // Instantiate the collision system
        const collisionSystem = new CollisionSystem();
        console.log("CollisionSystem instantiated:", collisionSystem);
        
        // Add systems to the world
        // IMPORTANT: Add TargetAssignmentSystem BEFORE MovementSystem
        if (typeof world.addSystem === 'function') {
            world.addSystem(renderSystem); // Render system usually first or last
            world.addSystem(targetAssignmentSystem); // Assign targets first
            world.addSystem(movementSystem); // Then move based on targets
            world.addSystem(collisionSystem);
            console.log("RenderSystem, TargetAssignmentSystem, MovementSystem, and CollisionSystem added to world.");
        } else {
            console.error("World.addSystem is not a function. Systems not added.");
        }

        // Create a randomly colored dot with random movement
        const randomVelocityX = (Math.random() - 0.5) * 50; // Random velocity between -25 and 25
        const randomVelocityY = (Math.random() - 0.5) * 50; // Random velocity between -25 and 25
        const dot = new Dot('dot1', 0, 0, randomVelocityX, randomVelocityY); // Start at center
        
        // Add the dot to the world
        if (typeof world.addEntity === 'function') {
            world.addEntity(dot);
            console.log("Random dot added to world:", dot);
            console.log("Dot components:", dot.components);
            console.log("Dot component names:", Object.keys(dot.components));
            console.log("World entities after adding dot:", Object.keys(world.entities));
            console.log("Dot transform:", dot.components.Transform);
            console.log("Dot appearance:", dot.components.Appearance);
        } else {
            console.error("World.addEntity is not a function. Dot not added.");
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
