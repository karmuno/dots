const Entity = require('./Entity'); // Assuming Entity.js is in the same directory

class World {
  constructor() {
    this.entities = {};
    this.systems = [];
    // Potentially a unique ID for the world itself, or other global settings
  }

  createEntity() {
    const entity = new Entity();
    this.entities[entity.id] = entity;
    return entity;
  }

  destroyEntity(entityId) {
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
    for (const system of this.systems) {
      if (typeof system.update === 'function') {
        system.update(this, dt); // Pass the world instance and delta time
      }
    }
  }
}

module.exports = World;
