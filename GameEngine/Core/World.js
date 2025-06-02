import Entity from './Entity.js'; // Assuming Entity.js is in the same directory
import BoundaryEntity from '../Entities/BoundaryEntity.js';
import GrowthSystem from '../Systems/GrowthSystem.js';

class World {
  constructor() {
    this.entities = {};
    this.systems = [];

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

  destroyEntity(entityId) {
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
}

export default World;
