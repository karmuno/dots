class Entity {
  static nextId = 0;

  constructor() {
    this.id = Entity.nextId++;
    this.components = {};
  }

  addComponent(component) {
    // Use component's class name as the key
    this.components[component.constructor.name] = component;
  }

  removeComponent(componentName) {
    delete this.components[componentName];
  }

  getComponent(componentName) {
    return this.components[componentName];
  }

  hasComponent(componentName) {
    return !!this.components[componentName];
  }
}

module.exports = Entity;
