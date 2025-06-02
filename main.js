// Import necessary classes
import GameLoop from './GameEngine/Core/GameLoop.js';
import World from './GameEngine/Core/World.js';
import RenderSystem from './GameEngine/Systems/RenderSystem.js';
import MovementSystem from './GameEngine/Systems/MovementSystem.js';
// import TargetAssignmentSystem from './GameEngine/Systems/TargetAssignmentSystem.js'; // Removed import
import CollisionSystem from './GameEngine/Systems/CollisionSystem.js';
import UISystem from './GameEngine/Systems/UISystem.js';
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
        const worldView = new WorldView(world, 800, 600); // Pass world instance
        console.log("WorldView instantiated:", worldView);

        const dotSheet = new DotSheet('dotInfoPanelContainer');
        console.log("DotSheet instantiated:", dotSheet);

        // Instantiate UISystem
        const uiSystem = new UISystem(world, dotSheet, colorPicker);
        console.log("UISystem instantiated:", uiSystem);

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
        // let selectedEntity = null; // Will use world.selectedEntity instead

        worldView.getCanvas().addEventListener('mousedown', function(event) {
            if (event.button === 0) { // Left mouse button
                // Entity selection logic removed. Now, left-click always initiates panning.
                // console.log("Canvas mousedown, entity selection disabled, enabling panning."); // Optional debug log

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

        // Create 2 initial dots using world.createDot()
        const dots = []; // Keep this array to easily reference the created dots, e.g., for firstDot initialization
        const numberOfInitialDots = 2;
        console.log(`Main: Creating ${numberOfInitialDots} initial dots...`);
        for (let i = 0; i < numberOfInitialDots; i++) {
            if (typeof world.createDot === 'function') {
                const newDot = world.createDot(); // createDot handles adding to world and logging
                if (newDot) {
                    dots.push(newDot);
                    console.log(`Main: Dot ${newDot.id} created and added to local 'dots' array.`);
                } else {
                    console.error(`Main: world.createDot() did not return a dot on iteration ${i}.`);
                }
            } else {
                console.error("Main: world.createDot is not a function. Cannot create initial dots.");
                // Potentially break or throw an error here if critical
                break; 
            }
        }
        console.log(`Main: Finished creating ${dots.length} initial dots.`);

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

        // Initialize color picker to match the first dot's initial color
        // Ensure there's at least one dot created before trying to access it
        if (dots.length > 0) {
            const firstDot = dots[0];
            const initialColor = firstDot.components.Appearance.color;
            const r = parseInt(initialColor.slice(1, 3), 16);
            const g = parseInt(initialColor.slice(3, 5), 16);
            const b = parseInt(initialColor.slice(5, 7), 16);
            colorPicker.setColor(r, g, b, true); // Silent initialization
        }
        
        // Initialize dot sheet to show the first dot
        // dotSheet.displayEntityInfo(firstDot); // UISystem might select one, or leave it unselected.
                                        // Or, explicitly select the first dot via UISystem if desired.
        // For now, let UISystem handle initial selection if any, or user interaction.
        // If `firstDot` should be selected initially, it must have InspectableComponent.
        // Let's ensure the first dot is selected if it's inspectable.
        // Ensure there's at least one dot created
        if (dots.length > 0) {
            const firstDot = dots[0]; // Re-reference for clarity in this block
            if (firstDot.components.InspectableComponent) {
                world.selectedEntity = firstDot; // Set it on the world
                dotSheet.displayEntityInfo(world.selectedEntity); // Update dotSheet
                console.log(`Main: Initialized selection and dot sheet with ${firstDot.id}`);
            } else {
                // If the initial dot is not inspectable (though Dot constructor should add it),
                // select the next available inspectable entity.
                console.warn(`Main: First created dot ${firstDot.id} is not inspectable. Attempting to select next.`);
                uiSystem.selectNextInspectableEntity();
            }
        } else {
            console.warn("Main: No dots were created, skipping initial selection and color picker setup for a dot.");
            // Optionally, clear dotSheet or set a default state if no entities are present
            dotSheet.clearDisplay(); // Example: clear display if no dots
        }
        
        // Setup color picker change listener to update the selected dot's color
        colorPicker.onColorChange((color) => {
            // console.log("Color changed in picker:", color); // Can be verbose
            const hexColor = rgbToHex(color.r, color.g, color.b);
            // console.log("Converted to Hex:", hexColor); // Can be verbose
            if (world.selectedEntity && world.selectedEntity.components.Appearance) {
                world.selectedEntity.components.Appearance.color = hexColor;
                console.log("Selected dot color updated to:", hexColor);
            } else {
                console.warn("Attempted to update color, but selected entity or its Appearance component is missing.");
            }
        });

        // Start the game loop
        if (typeof gameLoop.start === 'function') {
            gameLoop.start();
            console.log("Game loop started.");
        } else {
            console.error("GameLoop.start is not a function. Game loop not started.");
        }

        // Event listener for "Next Dot" button
        const nextDotButton = document.getElementById('nextDotButton');
        if (nextDotButton) {
            nextDotButton.addEventListener('click', () => {
                console.log("Next Dot button clicked");
                if (uiSystem) {
                    uiSystem.selectNextInspectableEntity();
                } else {
                    console.error("UISystem not available");
                }
            });
        } else {
            console.warn("Next Dot button not found.");
        }

        // TODO: Add a "Previous Dot" button to index.html with id="previousDotButton"
        // Example: <button id="previousDotButton">Previous Dot</button>
        // This button would typically be placed near the "Next Dot" button.

        // Event listener for "Previous Dot" button
        const previousDotButton = document.getElementById('previousDotButton');
        if (previousDotButton) {
            previousDotButton.addEventListener('click', () => {
                console.log("Previous Dot button clicked");
                if (uiSystem) {
                    uiSystem.selectPreviousInspectableEntity();
                } else {
                    console.error("UISystem not available");
                }
            });
        } else {
            console.warn("Previous Dot button not found.");
        }

        // TODO: Add a "Create Dot" button to index.html with id="createDotButton"
        // Example: <button id="createDotButton">Create Dot</button>
        // This button could be placed alongside other control buttons.

        // Event listener for "Create Dot" button
        const createDotButton = document.getElementById('createDotButton');
        if (createDotButton) {
            createDotButton.addEventListener('click', () => {
                console.log("Create Dot button clicked");
                if (!world || typeof world.createDot !== 'function') {
                    console.error("World or world.createDot() method not available.");
                    return;
                }

                const newDot = world.createDot();
                if (newDot) {
                    console.log(`Main: New dot ${newDot.id} created by button.`);
                    world.selectedEntity = newDot; // Make the new dot the selected entity

                    if (dotSheet && typeof dotSheet.displayEntityInfo === 'function') {
                        dotSheet.displayEntityInfo(world.selectedEntity);
                    } else {
                        console.warn("DotSheet or displayEntityInfo method not available for new dot.");
                    }

                    // Update color picker to new dot's color
                    if (colorPicker && newDot.components.Appearance) {
                        const color = newDot.components.Appearance.color;
                        try {
                            const r = parseInt(color.slice(1, 3), 16);
                            const g = parseInt(color.slice(3, 5), 16);
                            const b = parseInt(color.slice(5, 7), 16);
                            colorPicker.setColor(r, g, b, true); // Silent update
                            console.log(`Main: Color picker updated to ${newDot.id}'s color (${color}).`);
                        } catch (e) {
                            console.error("Error parsing color for color picker:", e);
                        }
                    } else {
                        console.warn("ColorPicker or Appearance component not available for new dot.");
                    }
                } else {
                    console.error("Main: world.createDot() failed to return a new dot when invoked by button.");
                }
            });
        } else {
            console.warn("Create Dot button not found.");
        }

        // TODO: Add a "Delete Dot" button to index.html with id="deleteDotButton"
        // Example: <button id="deleteDotButton">Delete Selected Dot</button>
        // This button would typically be placed near other entity manipulation buttons.

        // Event listener for "Delete Dot" button
        const deleteDotButton = document.getElementById('deleteDotButton');
        if (deleteDotButton) {
            deleteDotButton.addEventListener('click', () => {
                console.log("Delete Dot button clicked.");

                if (!world || typeof world.deleteDot !== 'function') {
                    console.error("World or world.deleteDot() method not available.");
                    return;
                }
                if (!uiSystem || typeof uiSystem.selectNextInspectableEntity !== 'function') {
                    console.error("UISystem or selectNextInspectableEntity method not available.");
                    return;
                }

                if (world.selectedEntity) {
                    const selectedDotId = world.selectedEntity.id;
                    console.log(`Main: Attempting to delete selected dot: ${selectedDotId}`);
                    
                    const deleteSuccess = world.deleteDot(selectedDotId);

                    if (deleteSuccess) {
                        console.log(`Main: Dot ${selectedDotId} successfully deleted from world.`);
                        world.selectedEntity = null; // Clear current selection

                        // Attempt to select the next inspectable entity.
                        // selectNextInspectableEntity should handle UI updates (dotSheet, colorPicker)
                        // and the case where no more inspectable entities are left.
                        uiSystem.selectNextInspectableEntity();
                        console.log("Main: Called selectNextInspectableEntity after deletion.");
                        
                        // If after selectNextInspectableEntity, there's no selected entity,
                        // it implies no inspectable entities are left.
                        // The selectNextInspectableEntity method in UISystem should ideally clear the dotSheet
                        // and colorPicker if no entity becomes selected.
                        // Explicitly:
                        if (!world.selectedEntity && dotSheet && typeof dotSheet.clearDisplay === 'function') {
                             // console.log("Main: No entity selected after deletion and next attempt, clearing dotSheet.");
                             // dotSheet.clearDisplay(); // This might be redundant if UISystem handles it.
                        }

                    } else {
                        console.warn(`Main: Failed to delete dot ${selectedDotId} from world (world.deleteDot returned false).`);
                    }
                } else {
                    console.log("Main: No dot selected to delete.");
                }
            });
        } else {
            console.warn("Delete Dot button not found.");
        }

        // Event listener for "Tab" key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                console.log("Tab key pressed");
                if (uiSystem) {
                    uiSystem.selectNextInspectableEntity();
                } else {
                    console.error("UISystem not available");
                }
            }
        });

    } catch (error) {
        console.error("Error initializing game:", error);
    }
});
