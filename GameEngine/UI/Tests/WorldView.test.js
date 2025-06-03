import WorldView from '../WorldView.js';
import { jest } from '@jest/globals';

// Mocking document.createElement and document.body.appendChild for non-browser environment
const mockCanvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(function(contextType) {
        if (contextType === '2d') {
            // Reset clearRectCalledWith for each getContext call if needed, or ensure mockContext is fresh
            mockContext.clearRectCalledWith = null;
            return mockContext;
        }
        return null;
    }),
    // Add other canvas properties/methods if needed by WorldView
};
const mockContext = {
    clearRect: jest.fn(function(x, y, width, height) {
        mockContext.clearRectCalledWith = { x, y, width, height };
    }),
    clearRectCalledWith: null, // To check arguments
    // Properties for image smoothing tests
    imageSmoothingEnabled: undefined,
    mozImageSmoothingEnabled: undefined,
    webkitImageSmoothingEnabled: undefined,
    msImageSmoothingEnabled: undefined,
    // Add other context methods if WorldView directly calls them
};

// Keep a reference to the original document if it exists (e.g. in a JSDOM environment from Jest)
const originalDocument = global.document;

describe('WorldView', () => {
    let view;

    beforeEach(() => {
        // Setup mocks for document and appendChild before each test
        global.document = {
            createElement: jest.fn(tagName => {
                if (tagName === 'canvas') {
                    // Return a fresh mock canvas for each WorldView instance if constructor modifies it
                    // Or reset properties of the shared mockCanvas
                    mockCanvas.width = 0;
                    mockCanvas.height = 0;
                    mockCanvas.getContext.mockClear(); // Clear mock calls for getContext
                    mockContext.clearRect.mockClear(); // Clear mock calls for clearRect
                    mockContext.clearRectCalledWith = null;
                    return mockCanvas;
                }
                // Fallback for other elements if WorldView creates them
                return originalDocument ? originalDocument.createElement(tagName) : {};
            }),
            getElementById: jest.fn(id => {
                if (id === 'uiContainer') {
                    return { appendChild: jest.fn() }; // Mock the uiContainer and its appendChild
                }
                return null;
            }),
            body: {
                appendChild: jest.fn(),
                // Store what was appended if needed for assertions
                appendedChild: null
            }
        };
        // Assign appendedChild inside the mock if you need to check it
        // Note: WorldView actually appends to 'uiContainer', not document.body directly based on WorldView.js
        // So, the mock for getElementById('uiContainer').appendChild will be called.
        // If direct document.body.appendChild was also used by WorldView, this would also be relevant:
        // global.document.body.appendChild.mockImplementation(element => {
        //     global.document.body.appendedChild = element;
        // });

        // Create a new WorldView instance for each test
        const mockWorld = { entities: {} };
        view = new WorldView(mockWorld, 100, 50);
    });

    afterEach(() => {
        // Restore original document to avoid interference between test files
        global.document = originalDocument;
    });

    test('constructor should create an HTMLCanvasElement', () => {
        expect(global.document.createElement).toHaveBeenCalledWith('canvas');
        expect(view.getCanvas()).toBe(mockCanvas);
    });

    test('constructor should set the specified width and height on the canvas', () => {
        expect(view.getCanvas().width).toBe(100);
        expect(view.getCanvas().height).toBe(50);
    });

    test('constructor should append the canvas to the document body', () => {
        expect(global.document.body.appendChild).toHaveBeenCalledWith(mockCanvas);
        expect(global.document.body.appendedChild).toBe(mockCanvas);
    });

    test('getContext should return a 2D rendering context', () => {
        const context = view.getContext();
        expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
        expect(context).toBe(mockContext);
    });

    test('getCanvas should return the created canvas element', () => {
        expect(view.getCanvas()).toBe(mockCanvas);
    });

    test('clear should call clearRect on the context with correct dimensions', () => {
        view.clear();
        expect(mockContext.clearRect).toHaveBeenCalledTimes(1);
        expect(mockContext.clearRectCalledWith).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    });

    describe('setImageSmoothing', () => {
        beforeEach(() => {
            // Reset smoothing properties on the mock context before each smoothing test
            mockContext.imageSmoothingEnabled = undefined;
            mockContext.mozImageSmoothingEnabled = undefined;
            mockContext.webkitImageSmoothingEnabled = undefined;
            mockContext.msImageSmoothingEnabled = undefined;
        });

        test('should set imageSmoothingEnabled and vendor-specific properties to true', () => {
            view.setImageSmoothing(true);
            expect(mockContext.imageSmoothingEnabled).toBe(true);
            expect(mockContext.mozImageSmoothingEnabled).toBe(true);
            expect(mockContext.webkitImageSmoothingEnabled).toBe(true);
            expect(mockContext.msImageSmoothingEnabled).toBe(true);
        });

        test('should set imageSmoothingEnabled and vendor-specific properties to false', () => {
            view.setImageSmoothing(false);
            expect(mockContext.imageSmoothingEnabled).toBe(false);
            expect(mockContext.mozImageSmoothingEnabled).toBe(false);
            expect(mockContext.webkitImageSmoothingEnabled).toBe(false);
            expect(mockContext.msImageSmoothingEnabled).toBe(false);
        });
    });
});
