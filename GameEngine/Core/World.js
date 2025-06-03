import Entity from './Entity.js'; // Assuming Entity.js is in the same directory
import BoundaryEntity from '../Entities/BoundaryEntity.js';
import GrowthSystem from '../Systems/GrowthSystem.js';
import Dot from '../Entities/Dot.js';
import Dit from '../Entities/Dit.js';

class World {
  constructor() {
    this.entities = {};
    this.systems = [];
    this.dotCounter = 0; // Initialize dotCounter
    this.ditCounter = 0; // Initialize ditCounter

    // Create and store the boundary entity
    const boundary = new BoundaryEntity(); // BoundaryEntity itself is a subclass of Entity
    this.entities[boundary.id] = boundary;
    this.boundary = boundary; // Keep a direct reference for easy access

    // Add GrowthSystem
    const growthSystem = new GrowthSystem();
    this.addSystem(growthSystem);
  }

  createEntity() {
    const entity = new Entity();
    this.entities[entity.id] = entity;
    return entity;
  }

  addEntity(entity) {
    this.entities[entity.id] = entity;
    return entity;
  }

  removeEntity(entityId) {
    // Also remove from this.boundary if it's the one being destroyed
    if (this.boundary && this.boundary.id === entityId) {
        // Handle boundary destruction, maybe prevent it or re-create
        console.warn("Boundary entity destroyed. The world might not behave as expected.");
        this.boundary = null; 
    }
    delete this.entities[entityId];
  }

  getEntityById(entityId) {
    return this.entities[entityId];
  }

  addSystem(system) {
    this.systems.push(system);
  }

  removeSystem(system) {
    this.systems = this.systems.filter(s => s !== system);
  }

  update(dt) {
    // Update all systems
    for (const system of this.systems) {
      if (typeof system.update === 'function') {
        system.update(this, dt); // Pass the world instance and delta time
      }
    }

    // Note: If entities themselves had update methods, you might call them here,
    // but the ECS pattern prefers systems to handle all logic.
    // The GrowthSystem will handle updating the boundary's radius.
  }

  createDot() {
    this.dotCounter++;
    const id = `dot${this.dotCounter}`;

    // Generate random properties for the dot
    // Random position within +/- 100 units from center (0,0)
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;

    // Random velocity between -25 and 25 for each axis
    const velocityX = (Math.random() - 0.5) * 50;
    const velocityY = (Math.random() - 0.5) * 50;

    // Instantiate a new Dot. The Dot constructor handles its own default color
    // and adds InspectableComponent.
    const dot = new Dot(id, x, y, velocityX, velocityY);

    // Add the newly created dot to the world's entities
    this.addEntity(dot);

    console.log(`World: Created new dot - ID: ${id}, X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, VelX: ${velocityX.toFixed(2)}, VelY: ${velocityY.toFixed(2)}`);

    return dot;
  }

  createDit() {
    this.ditCounter++;
    const id = `dit${this.ditCounter}`;

    // Generate random RGB nutrient values (0-255)
    const randomRed = Math.floor(Math.random() * 256);
    const randomGreen = Math.floor(Math.random() * 256);
    const randomBlue = Math.floor(Math.random() * 256);
    
    // Get initial boundary radius (default 100 from BoundaryEntity constructor)
    const initialRadius = this.boundary ? this.boundary.components.RadiusComponent.radius : 100;
    
    // Generate random position within the initial boundary radius with some margin
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (initialRadius - 10); // 10 pixel margin from boundary
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    // Instantiate a new Dit with randomized nutrient values
    const dit = new Dit(id, x, y, { 
      red: randomRed, 
      green: randomGreen, 
      blue: randomBlue 
    });

    // Add the newly created dit to the world's entities
    this.addEntity(dit);

    console.log(`World: Created new dit - ID: ${id}, X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, RGB: (${randomRed}, ${randomGreen}, ${randomBlue})`);

    return dit;
  }

  deleteDot(entityId) {
    const entityToDelete = this.entities[entityId];

    if (entityToDelete) {
      // Log details of the entity being deleted (optional, but good for debugging)
      // console.log(`World: Attempting to delete entity with ID: ${entityId}`, entityToDelete);

      // Check if the entity being deleted is the world boundary
      if (this.boundary && this.boundary.id === entityId) {
        console.warn(`World: The boundary entity (ID: ${entityId}) is being deleted. The world edge will be removed.`);
        this.boundary = null;
      }

      delete this.entities[entityId];
      console.log(`World: Entity with ID '${entityId}' has been deleted.`);
      return true; // Indicate success
    } else {
      console.warn(`World: Attempted to delete entity with ID '${entityId}', but it was not found.`);
      return false; // Indicate failure
    }
  }
}

export default World;
