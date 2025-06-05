/**
 * @class System
 * @description Base class for all systems in the game engine.
 * Systems are responsible for updating entities that have a specific set of components.
 */
export default class System {
    /**
     * @constructor
     */
    constructor() {
        // Placeholder for any future common system initialization
    }

    /**
     * @method update
     * @description Abstract method to be implemented by derived systems.
     * This method is called by the game loop on each frame.
     * @param {World} world - The game world.
     * @param {number} deltaTime - The time elapsed since the last update.
     */
    update(world, deltaTime) {
        // This method should be overridden by concrete system implementations
        // console.warn("System.update() called on base System class. Did you forget to override it in a derived class?");
    }
}
