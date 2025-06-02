import Component from '../Core/Component.js';

/**
 * @class DrawLayer
 * @extends Component
 * @description Component that determines the rendering order of entities.
 * Higher layer values are rendered on top of lower values.
 */
export default class DrawLayer extends Component {
  /**
   * @constructor
   * @param {number} layer - The draw layer value. Higher values render on top.
   */
  constructor(layer = 0) {
    super();
    this.layer = layer;
  }
}