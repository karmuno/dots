// GameEngine/Components/InspectableComponent.js

/**
 * @class InspectableComponent
 * @description A marker component indicating that an entity can be clicked
 *              to display its information in the DotSheet panel.
 */
export default class InspectableComponent {
  constructor() {
    this.isInspectable = true; // A simple flag to identify inspectable entities.
                               // This can be expanded later if needed.
  }
}
