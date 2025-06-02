const assert = require('assert');
const ColorPicker = require('../ColorPicker.js');

// More sophisticated JSDOM-like mock if needed for full event simulation
// For now, relying on ColorPicker's internal document mock and direct interactions.
// If events are needed:
let eventListeners = {};
const mockDocument = {
    createElement: (tagName) => {
        const element = {
            tagName: tagName.toLowerCase(),
            style: {},
            className: '',
            min: '',
            max: '',
            value: '',
            type: '',
            listeners: {},
            addEventListener: (type, callback) => {
                if (!element.listeners[type]) {
                    element.listeners[type] = [];
                }
                element.listeners[type].push(callback);
            },
            dispatchEvent: (event) => {
                if (element.listeners[event.type]) {
                    element.listeners[event.type].forEach(cb => cb(event));
                }
            },
            appendChild: () => {}, // Simplified
            // Mock properties for sliders
            _value: '0', // Internal storage for value
            get value() { return this._value; },
            set value(val) { 
                this._value = String(val); // Sliders store values as strings
                // Simulate oninput event if type is range
                if (this.type === 'range' && this.listeners['input']) {
                     this.dispatchEvent({ type: 'input', target: this });
                }
            }
        };
        return element;
    },
    getElementById: () => null, // Not used by ColorPicker directly
};

// Replace ColorPicker's document with our mock *before* tests run
global.document = mockDocument;


describe('ColorPicker', () => {
    let colorPicker;
    let container;

    beforeEach(() => {
        // Create a dummy container for the ColorPicker
        container = mockDocument.createElement('div');
        // Reset global document to our mock for each test if necessary,
        // though it's set globally above.
        global.document = mockDocument; 
        colorPicker = new ColorPicker(container);
    });

    it('should initialize with default color black (0,0,0)', () => {
        const color = colorPicker.getColor();
        assert.deepStrictEqual(color, { r: 0, g: 0, b: 0 }, 'Default color should be black');
    });

    it('getColor() should return the current color', () => {
        // Directly set internal color properties for this test,
        // as simulating slider interaction precisely might be complex
        // without full JSDOM or if the mock is insufficient.
        colorPicker.r = 10;
        colorPicker.g = 20;
        colorPicker.b = 30;
        assert.deepStrictEqual(colorPicker.getColor(), { r: 10, g: 20, b: 30 });
    });

    it('should update color correctly when R slider changes', (done) => {
        // Test relies on the enhanced mock for sliders
        // The ColorPicker's createSlider method returns the label and slider.
        // We need to access the created slider instance.
        // The sliders are named rSlider, gSlider, bSlider internally.
        
        colorPicker.onColorChange((newColor) => {
            assert.deepStrictEqual(newColor, { r: 125, g: 0, b: 0 });
            assert.strictEqual(colorPicker.r, 125, 'Internal R value should be updated');
            done();
        });

        // Simulate slider input by setting its value property,
        // which should trigger the 'input' event via the setter in our mock.
        if (colorPicker.rSlider && colorPicker.rSlider.slider) {
            colorPicker.rSlider.slider.value = '125'; 
        } else {
            assert.fail('R slider was not properly initialized or accessible.');
        }
    });

    it('should update color correctly when G slider changes', (done) => {
        colorPicker.onColorChange((newColor) => {
            assert.deepStrictEqual(newColor, { r: 0, g: 150, b: 0 });
            assert.strictEqual(colorPicker.g, 150, 'Internal G value should be updated');
            done();
        });
        if (colorPicker.gSlider && colorPicker.gSlider.slider) {
            colorPicker.gSlider.slider.value = '150';
        } else {
            assert.fail('G slider was not properly initialized or accessible.');
        }
    });

    it('should update color correctly when B slider changes', (done) => {
        colorPicker.onColorChange((newColor) => {
            assert.deepStrictEqual(newColor, { r: 0, g: 0, b: 175 });
            assert.strictEqual(colorPicker.b, 175, 'Internal B value should be updated');
            done();
        });

        if (colorPicker.bSlider && colorPicker.bSlider.slider) {
            colorPicker.bSlider.slider.value = '175';
        } else {
            assert.fail('B slider was not properly initialized or accessible.');
        }
    });
    
    it('onColorChange callback should be triggered with the correct color', (done) => {
        const expectedColor = { r: 100, g: 150, b: 200 };
        
        colorPicker.onColorChange((color) => {
            assert.deepStrictEqual(color, expectedColor, 'Callback color does not match expected');
            done();
        });

        // Simulate changes that would trigger onColorChange
        // For simplicity, directly calling handleColorChange after setting values,
        // or rely on slider event simulation if robust.
        // Using slider simulation:
        if (colorPicker.rSlider && colorPicker.rSlider.slider &&
            colorPicker.gSlider && colorPicker.gSlider.slider &&
            colorPicker.bSlider && colorPicker.bSlider.slider) {
            
            // Sequentially set values. The last one will trigger the specific check.
            // Need a more sophisticated way to test combined changes or a single callback.
            // Let's re-think this specific test for multiple changes.
            
            // For this test, let's simulate one change and check.
            // The individual slider tests already cover individual changes.
            // This test is more about the mechanism of the callback.
            
            // Re-assigning to a new picker to isolate the callback listener for this test.
            colorPicker = new ColorPicker(container);
            colorPicker.onColorChange((color) => {
                assert.deepStrictEqual(color, {r: 50, g: 0, b:0}, 'Callback color does not match expected for single change');
                done();
            });
            colorPicker.rSlider.slider.value = '50'; // This should trigger it

        } else {
             assert.fail('Sliders not initialized for onColorChange test');
        }
    });

    it('should clamp values if they were somehow set outside 0-255 (testing internal logic)', () => {
        // This test is more conceptual for the current ColorPicker, as sliders prevent this.
        // However, the internal clamping was added: this.r = Math.max(0, Math.min(255, parseInt(value)));
        // We can test this by manually calling the callback that sliders use.
        
        const rSliderCallback = colorPicker.rSlider.slider.listeners['input'][0];
        const event = { target: { value: '300' } };
        rSliderCallback(event); // Simulate event with out-of-range value
        assert.strictEqual(colorPicker.r, 255, 'R value should be clamped to 255');

        event.target.value = '-50';
        rSliderCallback(event); // Simulate event with out-of-range value
        assert.strictEqual(colorPicker.r, 0, 'R value should be clamped to 0');
        
        // Check a valid value within the range
        event.target.value = '123';
        rSliderCallback(event);
        assert.strictEqual(colorPicker.r, 123, 'R value should be set to 123');
    });

});

// Note: To run these tests, you would typically use a test runner like Mocha or Jest.
// e.g., mocha GameEngine/UI/Tests/ColorPicker.test.js
// Ensure Node.js is installed.
// The `describe` and `it` syntax is from Mocha.
// The `assert` module is built into Node.js.
console.log("ColorPicker.test.js loaded. Run with a test runner e.g. Mocha.");

// Basic run for sanity check if no test runner:
// This is NOT a substitute for a real test runner.
function runBasicSanityChecks() {
    console.log("\n--- Running Basic Sanity Checks (NOT a full test suite run) ---");
    let testsPassed = 0;
    let testsFailed = 0;

    const test = (name, fn) => {
        try {
            fn();
            console.log(`[PASS] ${name}`);
            testsPassed++;
        } catch (e) {
            console.error(`[FAIL] ${name}`);
            console.error(e);
            testsFailed++;
        }
    };
    
    // Re-mock document for local run if needed (already global)
    global.document = mockDocument;
    const localContainer = mockDocument.createElement('div');
    const picker = new ColorPicker(localContainer);

    test('Initialization', () => {
        assert.deepStrictEqual(picker.getColor(), { r: 0, g: 0, b: 0 });
    });

    test('getColor after direct set', () => {
        picker.r = 10; picker.g = 20; picker.b = 30;
        assert.deepStrictEqual(picker.getColor(), { r: 10, g: 20, b: 30 });
        picker.r = 0; picker.g = 0; picker.b = 0; // Reset
    });
    
    test('Clamping (direct call to internal logic)', () => {
        const rSliderEventCb = picker.rSlider.slider.listeners['input'][0];
        rSliderEventCb({target: {value: '500'}});
        assert.strictEqual(picker.r, 255);
        rSliderEventCb({target: {value: '-100'}});
        assert.strictEqual(picker.r, 0);
        rSliderEventCb({target: {value: '120'}});
        assert.strictEqual(picker.r, 120);
        picker.r = 0; // Reset
    });

    // Async tests are harder to do this way, skipping slider event tests for sanity check.
    // They require done() callbacks and proper async handling a test runner provides.

    console.log("--- Basic Sanity Checks Complete ---");
    console.log(`Passed: ${testsPassed}, Failed: ${testsFailed}`);
    if (testsFailed > 0) {
         console.log("NOTE: Some basic checks failed. For detailed async tests, use a test runner like Mocha.");
    } else {
        console.log("Basic checks passed. For detailed async tests, use a test runner like Mocha.");
    }
}

// runBasicSanityChecks(); // Uncomment to run basic checks if no test runner is immediately available.
// It's better to use a test runner.
