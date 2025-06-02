# Dots - A Sandbox for Evolving Complex Behaviors

Dots is a sandbox for systems architects and anyone interested in exploring the principles of emergent systems. The core philosophy is 'watching simple rules evolve into complex behaviors' through a systems-based approach. In this Evolution Sim / Social Sim / Systems Sandbox, you'll observe "Dot" entities governed by simple rules. These interactions, though initially basic, give rise to increasingly complex and fascinating emergent behaviors as the simulation progresses and the system evolves. It's a tool for understanding how intricate systems can arise from simple beginnings.

## Project Structure

The project is organized as follows:

- **`GameEngine/`**: Contains the core engine components, entities, systems, and UI elements.
  - **`Components/`**: Defines data components for "Dot" entities, like appearance, genetics, movement, needs, collider, and transform.
  - **`Core/`**: Includes fundamental engine building blocks such as `Component`, `Entity`, `GameLoop`, `World`, and `Camera`.
  - **`Entities/`**: Defines specific entity types like `Dot`, `Dat`, `Dit`, and `BoundaryEntity`.
  - **`Systems/`**: Houses the logic that processes entities and their components, including `MovementSystem`, `RenderSystem`, `CollisionSystem`, `GrowthSystem`, `UISystem`, and `WorldSystem`.
  - **`UI/`**: Contains user interface elements like `ColorPicker`, `DotSheet`, and `WorldView`.
- **`.gitignore`**: Specifies intentionally untracked files that Git should ignore.
- **`CLAUDE.md`**: Design document and notes (potentially AI-generated or related).
- **`DOTS_GDD.md`**: Game Design Document for the Dots project.
- **`DOTS_MVP_PLAN.md`**: Planning document for the Minimum Viable Product.
- **`index.html`**: The main HTML file for running the simulation in a web browser.
- **`LICENSE`**: The project's license file.
- **`main.js`**: Main JavaScript entry point for the application.
- **`package.json`**: Defines project metadata, dependencies, and scripts.
- **`README.md`**: This file, providing an overview of the project.

## Core Concepts and Features

This section outlines the fundamental mechanics and systems that drive the Dots simulation.

### Entity-Component-System (ECS) Architecture
Dots is built upon an Entity-Component-System (ECS) architecture. This design pattern separates data (Components) from behavior (Systems) and uses Entities as unique identifiers to associate them.
- **Entities** (`GameEngine/Core/Entity.js`): Simple identifiers for every object in the simulation.
- **Components** (`GameEngine/Components/`): Data containers that define aspects of an entity, like its appearance, needs, or position. Examples include `Appearance.js`, `Needs.js`, `Transform.js`.
- **Systems** (`GameEngine/Systems/`): Logic that processes entities possessing specific components. Examples include `MovementSystem.js`, `RenderSystem.js`.
- The **World** (`GameEngine/Core/World.js`) manages all entities, components, and systems, orchestrated by the **GameLoop** (`GameEngine/Core/GameLoop.js`).
This architecture promotes modularity, making it easier to add new features, modify existing ones, and allows for complex emergent behaviors as systems interact in unforeseen ways.

### Core Entity Types
The simulation revolves around three primary types of entities:
- **Dots (3x3 pixels):** The main actors. Each Dot has RGB-based genetics influencing its traits and behavior. They operate on a needs system (Hunger, Fear, Curiosity) that drives their actions, such as movement, interaction, and reproduction.
- **Dats (1x3 pixels):** Pheromone-like entities used for communication. Dots emit Dats to signal information to others. The color of a Dat signifies its meaning:
    - 🔴 Red: Danger/Fear
    - 🟢 Green: Food/Safety
    - 🔵 Blue: Social Signal/Mating
    - ⚪ White: Curiosity Beacon
- **Dits (1x1 pixels):** Waste material excreted by Dots. Dits accumulate in the environment, creating pressure that can influence Dot behavior (e.g., increasing Fear in Dit-heavy areas) and contributing to the ecological dynamics.

### Key Gameplay Systems
Several interconnected systems create the dynamic and evolving world of Dots:
- **Needs-Driven Behavior:** Each Dot possesses three internal meters: Hunger, Fear, and Curiosity. The current levels of these needs determine the Dot's dominant motivation and subsequent actions, leading to behaviors like seeking food, avoiding danger, or exploring.
- **RGB Genetics:** A Dot's color (RGB values) encodes its genetic traits. These traits influence its baseline needs, behaviors, and interactions with other Dots and the environment. Genetics are passed on during reproduction, with potential for mutation.
- **Communication System (Dats):** Dots interpret and react to Dats in their vicinity, allowing for indirect communication. This system enables complex social interactions, such as flocking, warning of danger, or finding mates.
- **Waste System (Dits):** The accumulation of Dits acts as environmental feedback. High concentrations can deter Dots or signify overpopulation, influencing movement patterns and survival strategies.
- **Evolution System:** Dots can reproduce, passing their genetic traits (RGB values) to offspring. This process includes inheritance and mutation, allowing lineages to adapt and change over generations. The system aims to support both asexual and sexual reproduction mechanics, leading to potential speciation.
- **Death System:** Dots have finite lifespans and can also die from starvation (Hunger meter remaining at maximum for too long). Death removes Dots from the simulation, returning their matter to the system (often as a final burst of Dits) and plays a crucial role in natural selection and evolutionary pressure.

## Getting Started

**Please Note:** Dots is currently in the early stages of development (MVP - "Single Dot Explorer"). The core systems are being built, and many of the features described in "Core Concepts and Features" are planned for future iterations. The current version focuses on establishing the foundational architecture.

To run the Dots game engine simulation:

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  **Open `index.html` in your web browser:**
    - Navigate to the root directory of the project.
    - Open the `index.html` file directly in a modern web browser (e.g., Chrome, Firefox, Safari, Edge).
3.  **Observe the Simulation and Console:**
    - You should see a visual representation of a single Dot moving on a canvas.
    - Open your browser's developer console (usually by pressing F12 or right-clicking and selecting "Inspect" -> "Console") to see log messages about the game loop and system operations (e.g., "main.js loaded", "World instantiated", "RenderSystem: Rendering world...").

The current MVP demonstrates a single Dot with random movement, basic color customization, and an expanding world, rendered on the canvas. The developer console provides supplementary information about the engine's processes.

## Usage

In Dots, you are a systems architect and observer. Your role is not to directly control individual Dots, but to tune the parameters of their world and behaviors, and then watch how complex systems emerge from these simple rules.

**Interacting with the Current MVP ("Single Dot Explorer"):**

The current version allows for the following interactions:

*   **Observe the Dot:** Watch the single Dot move randomly within its expanding circular world. Note its interactions with the boundaries.
*   **Customize Dot Appearance:**
    *   An RGB color customization panel is available. Use the sliders to select Red, Green, and Blue values.
    *   A preview will show the selected color. Click an "Apply" button (or similar) to change the Dot's color in real-time.
*   **Inspect the Dot:**
    *   Clicking on the Dot will bring up a "Dot Sheet" panel.
    *   This panel displays basic information about the Dot, such as its ID, current RGB color, position, speed, age (time since simulation start), and the current world radius.

**Future Interactions:**

As Dots evolves, your ability to influence the simulation will expand. Future developments will allow you to:

*   Tweak parameters governing Dot needs (Hunger, Fear, Curiosity).
*   Influence how Dots perceive and react to Dats (pheromones).
*   Modify aspects of the waste (Dits) and evolution systems.
*   Set initial conditions for simulations with multiple Dots.

The goal is to provide you with the tools to experiment with the underlying rules and observe the rich, emergent behaviors that arise from your configurations.

## Development Status and Roadmap

This section provides an overview of the project's current stage and planned future developments.

**Current Development Status: MVP - "Single Dot Explorer"**

Dots is currently at its Minimum Viable Product (MVP) stage, known as the "Single Dot Explorer." This foundational version includes:

*   A single 3x3 pixel Dot entity.
*   A random movement system for the Dot.
*   An expanding circular world boundary.
*   A user interface for customizing the Dot's RGB color.
*   A basic "Dot Sheet" panel that displays information like the Dot's ID, color, position, and speed.
*   Clean pixel-art rendering of the Dot and its environment.

This MVP establishes the core architecture for future expansion.

**Roadmap: Future Features and Iterations**

The following key features and systems are planned for subsequent iterations to build upon the current MVP:

1.  **Needs System Implementation:** Introducing internal Dot motivations such as Hunger, Fear, and Curiosity, which will drive more complex behaviors.
2.  **Dat (Pheromone) System:** Implementing Dat emission (for communication) and consumption (to affect Dot needs and behaviors).
3.  **Social Reproduction Mechanics:** Adding systems for Dots to reproduce, including trait inheritance (RGB genetics) and mutation, leading towards evolution. This will likely involve both asexual and later, more complex social/sexual reproduction.
4.  **Death and Aging Systems:** Introducing lifecycles for Dots, including death from starvation or old age, to create evolutionary pressure.
5.  **Multiple Dots and Speciation:** Expanding the simulation to support populations of Dots, with the goal of observing emergent social dynamics and the potential for distinct species to arise.

Further developments will continue to build on these systems, aiming for a rich sandbox where complex behaviors emerge from simple, observable rules.

## Technical Specifications

This section provides a brief overview of key technical details:

*   **Visual Style:** Pure pixel art with a minimal aesthetic, designed for clarity.
*   **Grid System:** The simulation occurs on a blank canvas with pixel-perfect positioning of entities.
*   **Entity Sizes:**
    *   Dots: 3x3 pixels
    *   Dats (Pheromones): 1x3 pixels (vertical)
    *   Dits (Waste): 1x1 pixels
*   **Core Design Values:**
    *   **Transparency:** All underlying systems are intended to be clear and observable.
    *   **Real-time Observation:** Behaviors unfold in real-time, allowing direct observation of cause and effect.
    *   **Emergent Complexity:** Complex, unpredictable behaviors arise from the interaction of simple rules.
    *   **Observer Role:** The player acts as an architect and observer, tuning systems rather than directly controlling entities.

## Contributing

We welcome contributions to improve and expand Dots. If you have new ideas, features, or find improvements, please consider opening an issue to discuss them first, especially for significant changes. Then, follow these steps for submitting your work:

1.  Fork the repository.
2.  Create a new branch for your feature or fix (e.g., `feature/new-evolution-mechanic` or `fix/rendering-bug`).
3.  Make your changes, including clear comments and tests (if applicable).
4.  Ensure your changes adhere to any existing coding style or conventions (though formal guidelines may still be evolving at this early project stage).
5.  Submit a pull request for review, clearly describing the changes you've made.
