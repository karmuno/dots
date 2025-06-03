// GameEngine/Core/Component.js
export default class Component {
    constructor(type) {
        this.type = type;
        this.entity = null; // Will be set when added to an entity
    }
}
