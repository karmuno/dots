class Appearance {
  constructor(options = {}) {
    this.color = options.color || '#FFFFFF'; // Default to white
    this.shape = options.shape || 'rectangle'; // 'rectangle', 'circle', 'sprite'

    // Sprite specific options
    this.spriteSheet = options.spriteSheet || null; // URL or reference to sprite sheet
    this.spriteKey = options.spriteKey || null;     // Key/name of the sprite in the sheet
    this.spriteSize = options.spriteSize || { width: 10, height: 10 }; // Default size for sprites if not specified

    // For basic shapes if not using sprites
    this.width = options.width || (this.shape === 'sprite' ? this.spriteSize.width : 10);
    this.height = options.height || (this.shape === 'sprite' ? this.spriteSize.height : 10);
    this.radius = options.radius || 5; // For circles

    this.visible = options.visible !== undefined ? options.visible : true; // Visibility flag
  }

  // Method to update color
  setColor(newColor) {
    this.color = newColor;
  }

  // Add other getters/setters as needed
  getColor() {
    return this.color;
  }

  getShape() {
    return this.shape;
  }

  isVisible() {
    return this.visible;
  }

  setVisible(visible) {
    this.visible = visible;
  }
}

export default Appearance;
