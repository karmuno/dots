// Import necessary classes
import GameLoop from './GameEngine/Core/GameLoop.js';
import World from './GameEngine/Core/World.js';
import RenderSystem from './GameEngine/Systems/RenderSystem.js';
import MovementSystem from './GameEngine/Systems/MovementSystem.js';
// import TargetAssignmentSystem from './GameEngine/Systems/TargetAssignmentSystem.js'; // Removed import
import CollisionSystem from './GameEngine/Systems/CollisionSystem.js';
import WorldView from './GameEngine/UI/WorldView.js';
import ColorPicker from './GameEngine/UI/ColorPicker.js'; // Import ColorPicker
import DotSheet from './GameEngine/UI/DotSheet.js';
import Dot from './GameEngine/Entities/Dot.js';

// Initial console log to confirm script start
console.log("main.js loaded.");

// Wait for the DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    try {
        // Get the color picker container
        const colorPickerContainer = document.getElementById('colorPickerContainer');
        if (!colorPickerContainer) {
            console.error("Color picker container not found in DOM.");
            return;
        }

        // Create and initialize ColorPicker
        const colorPicker = new ColorPicker(colorPickerContainer);
        // Note: onColorChange listener will be set up after 'dot' is created
        console.log("ColorPicker initialized and attached to container.");

        // Instantiate the world
        const world = new World();
        console.log("World instantiated:", world);

        // Create WorldView instance
        const worldView = new WorldView(800, 600);
        console.log("WorldView instantiated:", worldView);

        const dotSheet = new DotSheet('dotInfoPanelContainer');
        console.log("DotSheet instantiated:", dotSheet);

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
        let selectedEntity = null;

        worldView.getCanvas().addEventListener('mousedown', function(event) {
            if (event.button === 0) { // Left mouse button
                // Click detection logic
                const rect = worldView.getCanvas().getBoundingClientRect();
                const screenX = event.clientX - rect.left;
                const screenY = event.clientY - rect.top;

                const worldCoords = worldView.getCamera().screenToWorldCoordinates(screenX, screenY);

                let clickedEntity = null;
                for (const entityId in world.entities) {
                    const entity = world.entities[entityId];
                    if (entity.components.InspectableComponent) {
                        const transform = entity.components.Transform;
                        const appearance = entity.components.Appearance; // Or ColliderComponent

                        if (transform && appearance) {
                            const size = appearance.spriteSize || (appearance.width ? { width: appearance.width, height: appearance.height } : { width: 3, height: 3 }); // Default to 3x3 for Dot if not specified
                            const entityHalfWidth = size.width / 2;
                            const entityHalfHeight = size.height / 2;

                            if (worldCoords.x >= transform.position.x - entityHalfWidth &&
                                worldCoords.x <= transform.position.x + entityHalfWidth &&
                                worldCoords.y >= transform.position.y - entityHalfHeight &&
                                worldCoords.y <= transform.position.y + entityHalfHeight) {
                                clickedEntity = entity;
                                break; 
                            }
                        }
                    }
                }

                selectedEntity = clickedEntity;
                dotSheet.displayEntityInfo(selectedEntity);

                if (!selectedEntity) {
                    isPanning = true;
                    lastMouseX = event.clientX;
                    lastMouseY = event.clientY;
                } else {
                    isPanning = false; 
                }
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
        // const targetAssignmentSystem = new TargetAssignmentSystem(); // Removed instantiation
        // console.log("TargetAssignmentSystem instantiated:", targetAssignmentSystem);
        
        // Instantiate the collision system
        const collisionSystem = new CollisionSystem();
        console.log("CollisionSystem instantiated:", collisionSystem);
        
        // Add systems to the world
        // IMPORTANT: TargetAssignmentSystem was removed
        if (typeof world.addSystem === 'function') {
            world.addSystem(renderSystem); // Render system usually first or last
            // world.addSystem(targetAssignmentSystem); // Assign targets first // Removed
            world.addSystem(movementSystem); // Then move based on targets
            world.addSystem(collisionSystem); // Collision system after movement
            console.log("RenderSystem, MovementSystem, and CollisionSystem added to world.");
        } else {
            console.error("World.addSystem is not a function. Systems not added.");
        }

        // Create a randomly colored dot with random movement
        const randomVelocityX = (Math.random() - 0.5) * 50; // Random velocity between -25 and 25
        const randomVelocityY = (Math.random() - 0.5) * 50; // Random velocity between -25 and 25
        // Random position within 50 pixels of center
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50;
        const randomX = Math.cos(angle) * distance;
        const randomY = Math.sin(angle) * distance;
        const dot = new Dot('dot1', randomX, randomY, randomVelocityX, randomVelocityY);
        
        // Add the dot to the world
        if (typeof world.addEntity === 'function') {
            world.addEntity(dot);
            console.log("Random dot added to world:", dot);
            // console.log("Dot components:", dot.components);
            // console.log("Dot component names:", Object.keys(dot.components));
            // console.log("World entities after adding dot:", Object.keys(world.entities));
            // console.log("Dot transform:", dot.components.Transform);
            // console.log("Dot appearance:", dot.components.Appearance);
        } else {
            console.error("World.addEntity is not a function. Dot not added.");
        }

        // Instantiate the game loop with the world and renderer
        // The GameLoop constructor expects 'world' and 'renderer' (which is our renderSystem)
        const gameLoop = new GameLoop(world, renderSystem);
        console.log("GameLoop instantiated:", gameLoop);
        
        // Add dot sheet update to game loop
        const originalLoop = gameLoop._loop.bind(gameLoop);
        gameLoop._loop = function(currentTime) {
            originalLoop(currentTime);
            dotSheet.update();
        };

        // Helper function to convert single color component to two-digit hex
        function componentToHex(c) {
            const hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        // Helper function to convert RGB object to Hex string
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        // Initialize color picker to match the dot's initial color
        const initialColor = dot.components.Appearance.color;
        const r = parseInt(initialColor.slice(1, 3), 16);
        const g = parseInt(initialColor.slice(3, 5), 16);
        const b = parseInt(initialColor.slice(5, 7), 16);
        colorPicker.setColor(r, g, b, true); // Silent initialization
        
        // Initialize dot sheet to show the first dot
        dotSheet.displayEntityInfo(dot);
        
        // Setup color picker change listener to update the dot's color
        colorPicker.onColorChange((color) => {
            // console.log("Color changed in picker:", color); // Can be verbose
            const hexColor = rgbToHex(color.r, color.g, color.b);
            // console.log("Converted to Hex:", hexColor); // Can be verbose
            if (dot && dot.components.Appearance) {
                dot.components.Appearance.color = hexColor;
                console.log("Dot color updated to:", hexColor);
            } else {
                console.warn("Attempted to update color, but dot or its Appearance component is missing.");
            }
        });

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
