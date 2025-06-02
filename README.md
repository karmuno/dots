# Dots - A Sandbox for Evolving Complex Behaviors

Dots is a sandbox environment where simple rules govern "Dot" entities, leading to the emergence of complex and fascinating behaviors. It serves as a tool for systems architects and anyone interested in exploring the principles of emergent systems.

## Project Structure

The project is organized as follows:

- **`GameEngine/`**: Contains the core engine components, entities, systems, and UI elements.
  - **`Components/`**: Defines the different aspects of a Dot, such as its appearance, genetics, movement, needs, and transform (position, rotation, scale).
  - **`Core/`**: Includes the fundamental building blocks of the game engine, like `Component`, `Entity`, `GameLoop`, and `World`.
  - **`Entities/`**: Defines the specific types of entities in the simulation, such as `Dat`, `Dit`, and `Dot`.
  - **`Systems/`**: Houses the logic that processes entities and their components, like `MovementSystem`, `RenderSystem`, `UISystem`, and `WorldSystem`.
  - **`UI/`**: Contains user interface elements like `ColorPicker`, `DotSheet`, and `WorldView`.
- **`LICENSE`**: The project's license file.
- **`README.md`**: This file, providing an overview of the project.
- **Other files**: Configuration or markdown files like `CLAUDE.md`, `DOTS_GDD.md`, `DOTS_MVP_PLAN.md`.

## Getting Started

To run the Dots game engine simulation:

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  **Open `index.html` in your web browser:**
    - Navigate to the root directory of the project.
    - Open the `index.html` file directly in a modern web browser (e.g., Chrome, Firefox, Safari, Edge).
3.  **Check the Developer Console:**
    - Open your browser's developer console (usually by pressing F12 or right-clicking and selecting "Inspect" -> "Console").
    - You should see log messages indicating that the game loop has started and is running (e.g., "main.js loaded", "DOM fully loaded and parsed", "World instantiated", "RenderSystem instantiated", "GameLoop instantiated", "Game loop started", followed by repeating messages from the game loop like "GameLoop: world.update called..." and "RenderSystem: Rendering world...").

This basic setup runs a simple game loop that logs its operations to the console. Future developments will expand on rendering visuals to the canvas and implementing interactive behaviors.

## Usage

*(Instructions on how to interact with the simulation, configure parameters, or use the engine will be added here.)*

## Contributing

We welcome contributions to improve and expand Dots. If you have new ideas, features, or find improvements, please follow these steps:

1. Fork the repository.
2. Create a new branch.
3. Make your changes, including clear comments and tests (if applicable).
4. Submit a pull request for review.
