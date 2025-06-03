import ColorPicker from '../ColorPicker.js';
import { jest } from '@jest/globals'; // Already present, good.

// Mocking document and elements for Node.js environment
let mockDocument;

describe('ColorPicker', () => {
    let colorPicker;
    let container;

    beforeEach(() => {
        // Reset and define mocks for each test to ensure isolation
        eventListeners = {}; // Assuming this was global for the old custom runner
        mockDocument = {
            createElement: jest.fn((tagName) => {
                const element = {
                    tagName: tagName.toLowerCase(),
                    style: {},
                    className: '',
                    min: '',
                    max: '',
                    type: '',
                    listeners: {}, // Use a local listeners object for each element
                    addEventListener: jest.fn((type, callback) => {
                        if (!element.listeners[type]) {
                            element.listeners[type] = [];
                        }
                        element.listeners[type].push(callback);
                    }),
                    dispatchEvent: jest.fn((event) => {
                        if (element.listeners[event.type]) {
                            element.listeners[event.type].forEach(cb => cb(event));
                        }
                    }),
                    appendChild: jest.fn(),
                    _value: '0',
                    get value() { return this._value; },
                    set value(val) {
                        this._value = String(val);
                        if (this.type === 'range' && this.listeners['input']) {
                            // Create a mock event object
                            this.dispatchEvent({ type: 'input', target: this });
                        }
                    }
                };
                return element;
            }),
            getElementById: jest.fn(() => null), // Keep as is, not used by ColorPicker directly
        };
        global.document = mockDocument;

        container = mockDocument.createElement('div');
        colorPicker = new ColorPicker(container);
    });

    afterEach(() => {
        // Restore original document if it was modified for tests running in a JSDOM-like env from Jest
        // For now, as we are mocking it, this might not be strictly needed unless other tests interfere.
        // global.document = originalGlobalDocument; // Assuming originalGlobalDocument was saved
    });

    test('should initialize with default color black (0,0,0)', () => {
        const color = colorPicker.getColor();
        expect(color).toEqual({ r: 0, g: 0, b: 0 });
    });

    test('getColor() should return the current color', () => {
        colorPicker.r = 10;
        colorPicker.g = 20;
        colorPicker.b = 30;
        expect(colorPicker.getColor()).toEqual({ r: 10, g: 20, b: 30 });
    });

    test('should update color correctly when R slider changes', (done) => {
        colorPicker.onColorChange((newColor) => {
            try {
                expect(newColor).toEqual({ r: 125, g: 0, b: 0 });
                expect(colorPicker.r).toBe(125);
                done();
            } catch (error) {
                done(error);
            }
        });

        expect(colorPicker.rSlider && colorPicker.rSlider.slider).toBeDefined();
        colorPicker.rSlider.slider.value = '125';
    });

    test('should update color correctly when G slider changes', (done) => {
        colorPicker.onColorChange((newColor) => {
            try {
                expect(newColor).toEqual({ r: 0, g: 150, b: 0 });
                expect(colorPicker.g).toBe(150);
                done();
            } catch (error) {
                done(error);
            }
        });
        expect(colorPicker.gSlider && colorPicker.gSlider.slider).toBeDefined();
        colorPicker.gSlider.slider.value = '150';
    });

    test('should update color correctly when B slider changes', (done) => {
        colorPicker.onColorChange((newColor) => {
            try {
                expect(newColor).toEqual({ r: 0, g: 0, b: 175 });
                expect(colorPicker.b).toBe(175);
                done();
            } catch (error) {
                done(error);
            }
        });
        expect(colorPicker.bSlider && colorPicker.bSlider.slider).toBeDefined();
        colorPicker.bSlider.slider.value = '175';
    });
    
    test('onColorChange callback should be triggered with the correct color on a single slider change', (done) => {
        // Re-initialize picker for this specific callback test to ensure only one listener
        colorPicker = new ColorPicker(container);
        const expectedColor = { r: 50, g: 0, b: 0 };
        
        colorPicker.onColorChange((color) => {
            try {
                expect(color).toEqual(expectedColor);
                done();
            } catch (error) {
                done(error);
            }
        });
        
        expect(colorPicker.rSlider && colorPicker.rSlider.slider).toBeDefined();
        colorPicker.rSlider.slider.value = '50';
    });

    test('should clamp values if they were set outside 0-255 by simulating slider event', () => {
        // Access the event callback attached by ColorPicker to the slider mock
        const rSliderInputCallback = colorPicker.rSlider.slider.addEventListener.mock.calls.find(call => call[0] === 'input')[1];

        rSliderInputCallback({ target: { value: '300' } });
        expect(colorPicker.r).toBe(255);

        rSliderInputCallback({ target: { value: '-50' } });
        expect(colorPicker.r).toBe(0);

        rSliderInputCallback({ target: { value: '123' } });
        expect(colorPicker.r).toBe(123);
    });
});
