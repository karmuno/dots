class Appearance {
    constructor(config) {
        this.color = config.color || 'gray'; // Default color
        this.shape = config.shape;

        if (this.shape === 'circle') {
            this.radius = config.radius || 10; // Default radius for circle
        } else if (this.shape === 'rectangle') {
            this.width = config.width || 20; // Default width for rectangle
            this.height = config.height || 20; // Default height for rectangle
        } else {
            // Default to circle if shape is not specified or invalid
            // and radius is provided, otherwise it's a shapeless object
            // or we could throw an error.
            // For now, let's default to a circle if no valid shape provided.
            this.shape = 'circle';
            this.radius = config.radius || 10;
            // If no shape is given, and no radius, it might be better to log a warning
            // or handle it as an error, but for now, this will do.
        }
    }
}

export default Appearance;
