import RenderSystem from '../RenderSystem.js';
import { jest } from '@jest/globals';

// Mock WorldView class using Jest's mocking features
const mockWorldViewClear = jest.fn();
const mockWorldViewGetContext = jest.fn();
const mockWorldViewGetCanvas = jest.fn();

// Mock CanvasRenderingContext2D methods
const mockContextBeginPath = jest.fn();
const mockContextArc = jest.fn();
const mockContextFill = jest.fn();
const mockContextFillRect = jest.fn();
const mockContextStroke = jest.fn();
let mockContextFillStyle = ''; // Allow direct assignment for fillStyle

const MockWorldView = jest.fn().mockImplementation((width, height) => {
    const mockContextInstance = {
        beginPath: mockContextBeginPath,
        arc: mockContextArc,
        fill: mockContextFill,
        fillRect: mockContextFillRect,
        stroke: mockContextStroke,
        save: jest.fn(), // Add mock for save
        restore: jest.fn(), // Add mock for restore
        closePath: jest.fn(), // Add mock for closePath
        // Directly use the module-level variable for fillStyle to track changes
        get fillStyle() { return mockContextFillStyle; },
        set fillStyle(value) { mockContextFillStyle = value; },
    };
    mockWorldViewGetContext.mockReturnValue(mockContextInstance); // getContext returns this mock context

    return {
        width: width,
        height: height,
        canvas: { width: width, height: height }, // Simplified canvas
        clear: mockWorldViewClear,
        getContext: mockWorldViewGetContext,
        getCanvas: mockWorldViewGetCanvas, // If RenderSystem uses it
        getCamera: jest.fn().mockReturnValue({ // Mock getCamera and its return value if needed
            applyTransform: jest.fn(), // Add mock for applyTransform
            // Add other properties/methods of the camera object if RenderSystem uses them
            // For example, if it uses camera.getTransform(), camera.getPosition(), etc.
            // position: { x: 0, y: 0 },
            // zoom: 1,
            // getTransform: jest.fn().mockReturnValue({ /* mock transform object */ }),
        }),
        world: { selectedEntity: null }, // Add mock world object with selectedEntity
    };
});


describe('RenderSystem', () => {
    let renderSys;
    let mockViewInstance;

    beforeEach(() => {
        // Clear all mock implementations and calls before each test
        MockWorldView.mockClear();
        mockWorldViewClear.mockClear();
        mockWorldViewGetContext.mockClear();
        mockWorldViewGetCanvas.mockClear();

        mockContextBeginPath.mockClear();
        mockContextArc.mockClear();
        mockContextFill.mockClear();
        mockContextFillRect.mockClear();
        mockContextStroke.mockClear();
        mockContextFillStyle = ''; // Reset fillStyle

        // Create instances for each test
        mockViewInstance = new MockWorldView(800, 600);
        renderSys = new RenderSystem(mockViewInstance);
    });

    test('constructor stores the worldView instance', () => {
        expect(MockWorldView).toHaveBeenCalledWith(800, 600);
        expect(renderSys.worldView).toBe(mockViewInstance);
    });

    describe('render(world)', () => {
        let world;
        let entity1, entity2, entity3, entity4, entity5, rectEntity;

        beforeEach(() => {
            // Setup world and entities for render tests
            world = { entities: [] };
            entity1 = { // Valid circle
                id: 1,
                components: {
                    Appearance: { shape: 'circle', color: 'red', radius: 10 },
                    Transform: { position: { x: 50, y: 50 } }
                }
            };
            entity2 = { // No appearance
                id: 2,
                components: { Transform: { position: { x: 100, y: 100 } } }
            };
            entity3 = { // No transform
                id: 3,
                components: { Appearance: { shape: 'circle', color: 'blue', radius: 5 } }
            };
            entity4 = { // Wrong shape (for circle-only tests)
                id: 4,
                components: {
                    Appearance: { shape: 'square', color: 'green', size: 10 },
                    Transform: { position: { x: 150, y: 150 } }
                }
            };
            entity5 = { // Valid circle
                id: 5,
                components: {
                    Appearance: { shape: 'circle', color: 'purple', radius: 15 },
                    Transform: { position: { x: 200, y: 200 } }
                }
            };
            rectEntity = { // Valid rectangle
                id: 6,
                components: {
                    Appearance: { shape: 'rectangle', color: 'blue', width: 30, height: 40 },
                    Transform: { position: { x: 10, y: 20 } }
                }
            };
            world.entities = [entity1, entity2, entity3, entity4, entity5, rectEntity];
        });

        test('calls worldView.clear()', () => {
            renderSys.render(world);
            expect(mockWorldViewClear).toHaveBeenCalledTimes(1);
        });

        test('calls worldView.getContext()', () => {
            renderSys.render(world);
            // RenderSystem calls getContext at the start of its render method.
            expect(mockWorldViewGetContext).toHaveBeenCalledTimes(1);
        });

        test('correctly draws circle entities', () => {
            renderSys.render(world);
            expect(mockContextBeginPath).toHaveBeenCalledTimes(2); // For entity1 and entity5
            expect(mockContextArc).toHaveBeenCalledTimes(2);
            expect(mockContextFill).toHaveBeenCalledTimes(2);

            // Check parameters for the first circle (entity1)
            expect(mockContextArc).toHaveBeenNthCalledWith(1, 50, 50, 10, 0, Math.PI * 2);
            // Check parameters for the second circle (entity5)
            expect(mockContextArc).toHaveBeenNthCalledWith(2, 200, 200, 15, 0, Math.PI * 2);

            // Check that fillStyle was set correctly for the last drawn entity (entity5 - purple)
            // The actual fillStyle of the mock context will be the one set for the last entity.
            expect(mockContextFillStyle).toBe('purple');
        });

        test('correctly draws rectangle entities', () => {
            renderSys.render(world);
            expect(mockContextFillRect).toHaveBeenCalledTimes(1); // For rectEntity

            // Check parameters for the rectangle (rectEntity)
            expect(mockContextFillRect).toHaveBeenCalledWith(10, 20, 30, 40);

            // fillStyle should be 'blue' after drawing rectEntity if it was the last one with that style
            // However, the loop continues, so fillStyle will be for the last *rendered* entity overall.
            // To test rectEntity's fillStyle accurately, isolate it or check calls sequentially.
            // For simplicity, if only rectEntity was rendered:
            const worldWithOnlyRect = { entities: [rectEntity] };
            mockContextFillRect.mockClear(); // Clear previous calls
            mockContextFillStyle = ''; // Reset fillStyle
            renderSys.render(worldWithOnlyRect);
            expect(mockContextFillRect).toHaveBeenCalledTimes(1);
            expect(mockContextFillRect).toHaveBeenCalledWith(10, 20, 30, 40);
            expect(mockContextFillStyle).toBe('blue');
        });

        test('skips entities missing Appearance or Transform components, or with unknown shapes', () => {
            renderSys.render(world);
            // Total drawable entities: entity1 (circle), entity5 (circle), rectEntity (rectangle)
            expect(mockContextArc).toHaveBeenCalledTimes(2); // Circles
            expect(mockContextFillRect).toHaveBeenCalledTimes(1); // Rectangles
            // Total fill calls = 2 (circles) + 1 (rectangle) = 3
            expect(mockContextFill).toHaveBeenCalledTimes(3);
        });
    });
});
