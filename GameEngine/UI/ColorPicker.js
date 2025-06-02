class ColorPicker {
    constructor(container) {
        this.container = container;
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.listeners = [];

        this.initDOM();
        this.updateColorDisplay();
    }

    initDOM() {
        this.colorDisplay = document.createElement('div');
        this.colorDisplay.className = 'color-picker-display'; // Added class
        // Styles for basic dimensions can remain here or move to CSS
        this.colorDisplay.style.width = '100px'; 
        this.colorDisplay.style.height = '100px';
        // Border can be controlled by CSS via the new class
        // this.colorDisplay.style.border = '1px solid black'; 

        this.rSlider = this.createSlider('R', (value) => {
            // Clamp value to ensure it's within 0-255 range,
            // robust for future input methods beyond current sliders.
            this.r = Math.max(0, Math.min(255, parseInt(value)));
            this.handleColorChange();
        });
        this.gSlider = this.createSlider('G', (value) => {
            this.g = Math.max(0, Math.min(255, parseInt(value)));
            this.handleColorChange();
        });
        this.bSlider = this.createSlider('B', (value) => {
            this.b = Math.max(0, Math.min(255, parseInt(value)));
            this.handleColorChange();
        });

        this.container.appendChild(this.colorDisplay);
        
        const rControl = this.createSliderControl(this.rSlider.label, this.rSlider.slider);
        this.container.appendChild(rControl);
        
        const gControl = this.createSliderControl(this.gSlider.label, this.gSlider.slider);
        this.container.appendChild(gControl);

        const bControl = this.createSliderControl(this.bSlider.label, this.bSlider.slider);
        this.container.appendChild(bControl);
    }

    createSliderControl(label, slider) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'color-slider-control';
        controlDiv.appendChild(label);
        controlDiv.appendChild(slider);
        return controlDiv;
    }

    createSlider(labelText, callback) {
        const label = document.createElement('label');
        label.textContent = labelText;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '255';
        slider.value = '0';
        slider.addEventListener('input', (event) => callback(event.target.value));

        return { label, slider };
    }

    handleColorChange() {
        this.updateColorDisplay();
        this.notifyListeners();
    }

    // Note for future development:
    // If a direct method like `setColor({r, g, b})` is added,
    // ensure it also uses clamping/validation for r, g, b values
    // similar to what's done in the slider callbacks.
    // e.g., this.r = Math.max(0, Math.min(255, parseInt(newR)));

    updateColorDisplay() {
        this.colorDisplay.style.backgroundColor = `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    getColor() {
        return { r: this.r, g: this.g, b: this.b };
    }

    onColorChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        const color = this.getColor();
        this.listeners.forEach(listener => listener(color));
    }
}

// For Node.js environment if document is not defined
if (typeof document === 'undefined') {
    global.document = {
        createElement: () => ({
            style: {},
            appendChild: () => {},
            addEventListener: () => {}
        }),
    };
}

// Export the class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorPicker;
}
