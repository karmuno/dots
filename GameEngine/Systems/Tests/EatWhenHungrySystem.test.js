import EatWhenHungrySystem from '../EatWhenHungrySystem.js';
import World from '../../Core/World.js';
import Entity from '../../Core/Entity.js';
import EatWhenHungryComponent from '../../Components/EatWhenHungryComponent.js';
import SensorComponent from '../../Components/SensorComponent.js';
import AcceleratorComponent from '../../Components/AcceleratorComponent.js';
import EnergyComponent from '../../Components/EnergyComponent.js';
import Transform from '../../Components/Transform.js';

// jest.mock('../../Core/World.js');
// jest.mock('../../Core/Entity.js', () => {
//     let idCounter = 0;
//     return jest.fn().mockImplementation(() => ({
//         id: `mock-entity-${idCounter++}`,
//         hasComponent: jest.fn().mockReturnValue(true), // Assume has all components by default
//         getComponent: jest.fn(),
//         constructor: { name: 'Dot' } // Default type
//     }));
// });
// jest.mock('../../Components/EatWhenHungryComponent.js');
// jest.mock('../../Components/SensorComponent.js');
// jest.mock('../../Components/AcceleratorComponent.js');
// jest.mock('../../Components/EnergyComponent.js');
// jest.mock('../../Components/Transform.js');

// Manual mock function helper
const manualMockFn = (implementation) => { // Renamed to avoid conflict with createManualMock in other files if concatenated
    const mock = (...args) => {
        mock.calls.push(args);
        mock.callCount = mock.calls.length;
        if (mock.originalImplementation) {
            return mock.originalImplementation(...args);
        }
        return mock.returnValue;
    };
    mock.calls = [];
    mock.callCount = 0;
    mock.originalImplementation = implementation;
    mock.returnValue = undefined;
    mock.mockReturnValue = (value) => {
        mock.returnValue = value;
        return mock;
    };
    mock.mockImplementation = (newImpl) => {
        mock.originalImplementation = newImpl;
        return mock;
    };
    mock.getCall = (index) => mock.calls[index];
    return mock;
};

describe('EatWhenHungrySystem', () => {
    let system;
    let mockWorld;
    let mockDotEntity; // Renamed for clarity
    let mockEatHungry, mockSensor, mockAccelerator, mockEnergy, mockTransform;
    let mockDitEntityInstance;

    // Helper classes for testing types
    class Dit extends Entity { constructor(id) { super(id); this.getComponent = manualMockFn(); this.hasComponent = manualMockFn().mockReturnValue(true); } }
    class Dot extends Entity { constructor(id) { super(id); this.getComponent = manualMockFn(); this.hasComponent = manualMockFn().mockReturnValue(true); } }


    beforeEach(() => {
        system = new EatWhenHungrySystem();
        mockWorld = new World();
        mockDotEntity = new Dot('dot1'); // Use Dot class

        mockDotEntity.getComponent = manualMockFn(); // Ensure this is fresh for each test
        mockDotEntity.hasComponent = manualMockFn().mockReturnValue(true);


        mockEatHungry = new EatWhenHungryComponent(30);
        mockEatHungry.isHungry = manualMockFn().mockReturnValue(true);
        mockEatHungry.isActive = true;
        mockEatHungry.setTarget = manualMockFn();
        mockEatHungry.clearTarget = manualMockFn();

        mockSensor = new SensorComponent(50);
        mockSensor.getDetectedEntities = manualMockFn().mockReturnValue([]);

        mockAccelerator = new AcceleratorComponent(100, 1);
        mockAccelerator.setThrust = manualMockFn();
        mockAccelerator.stopThrust = manualMockFn();
        mockAccelerator.getThrustPower = manualMockFn().mockReturnValue(100);

        mockEnergy = new EnergyComponent(20, 100);
        mockEnergy.getEnergy = manualMockFn().mockReturnValue(20);

        mockTransform = new Transform(0, 0);

        mockDotEntity.getComponent.mockImplementation(ComponentType => {
            if (ComponentType === EatWhenHungryComponent) return mockEatHungry;
            if (ComponentType === SensorComponent) return mockSensor;
            if (ComponentType === AcceleratorComponent) return mockAccelerator;
            if (ComponentType === EnergyComponent) return mockEnergy;
            if (ComponentType === Transform) return mockTransform;
            return null;
        });

        mockWorld.getEntitiesByComponents = manualMockFn().mockReturnValue([mockDotEntity]);

        // Mock a "Dit" entity for detection
        mockDitEntityInstance = new Dit('dit1');
        const ditTransform = new Transform(10, 10);
        mockDitEntityInstance.getComponent.mockReturnValue(ditTransform);
        mockDitEntityInstance.hasComponent.mockReturnValue(true);
    });

    test('when hungry and Dit detected, sets thrust towards Dit', () => {
        mockSensor.getDetectedEntities.mockReturnValue([mockDitEntityInstance]);
        mockEatHungry.isHungry.mockReturnValue(true);

        system.update(mockWorld, 0.1);

        expect(mockAccelerator.setThrust.callCount).toBe(1);
        const expectedDirX = 10 / Math.sqrt(10*10 + 10*10);
        const expectedDirY = 10 / Math.sqrt(10*10 + 10*10);
        const callArgs = mockAccelerator.setThrust.getCall(0);
        expect(callArgs[0]).toBeCloseTo(expectedDirX);
        expect(callArgs[1]).toBeCloseTo(expectedDirY);
        expect(callArgs[2]).toBe(100);
        expect(mockEatHungry.setTarget.calls).toContainEqual([mockDitEntityInstance]);
    });

    test('when not hungry, stops thrust and clears target', () => {
        mockEatHungry.isHungry.mockReturnValue(false);

        system.update(mockWorld, 0.1);

        expect(mockAccelerator.stopThrust.callCount).toBe(1);
        expect(mockEatHungry.clearTarget.callCount).toBe(1);
    });

    test('when hungry but no Dits detected, stops thrust and clears target', () => {
        mockSensor.getDetectedEntities.mockReturnValue([]);
        mockEatHungry.isHungry.mockReturnValue(true);

        system.update(mockWorld, 0.1);

        expect(mockAccelerator.stopThrust.callCount).toBe(1);
        expect(mockEatHungry.clearTarget.callCount).toBe(1);
    });

    test('when AI is inactive, stops thrust and clears target', () => {
        mockEatHungry.isActive = false;
        mockSensor.getDetectedEntities.mockReturnValue([mockDitEntityInstance]);
        mockEatHungry.isHungry.mockReturnValue(true);

        system.update(mockWorld, 0.1);

        expect(mockAccelerator.stopThrust.callCount).toBe(1);
        expect(mockEatHungry.clearTarget.callCount).toBe(1);
        expect(mockAccelerator.setThrust.callCount).toBe(0);
    });

    test('chooses the nearest Dit if multiple are detected', () => {
        const closerDit = new Dit('closerDit'); // Use Dit class
        const closerDitTransform = new Transform(5, 5);
        closerDit.getComponent.mockReturnValue(closerDitTransform);


        const fartherDit = new Dit('fartherDit'); // Use Dit class
        const fartherDitTransform = new Transform(10, 10);
        fartherDit.getComponent.mockReturnValue(fartherDitTransform);

        mockSensor.getDetectedEntities.mockReturnValue([fartherDit, closerDit]);
        mockEatHungry.isHungry.mockReturnValue(true);

        system.update(mockWorld, 0.1);

        expect(mockAccelerator.setThrust.callCount).toBe(1);
        const expectedDirX = 5 / Math.sqrt(5*5 + 5*5);
        const expectedDirY = 5 / Math.sqrt(5*5 + 5*5);
        const callArgs = mockAccelerator.setThrust.getCall(0);
        expect(callArgs[0]).toBeCloseTo(expectedDirX);
        expect(callArgs[1]).toBeCloseTo(expectedDirY);
        expect(callArgs[2]).toBe(100);
        expect(mockEatHungry.setTarget.calls).toContainEqual([closerDit]);
    });

    test('does not target Dits without Transform', () => {
        mockDitEntityInstance.hasComponent.mockReturnValue(false); // Dit has no transform
        mockSensor.getDetectedEntities.mockReturnValue([mockDitEntityInstance]);
        mockEatHungry.isHungry.mockReturnValue(true);

        system.update(mockWorld, 0.1);

        expect(mockAccelerator.stopThrust.callCount).toBe(1);
        expect(mockEatHungry.clearTarget.callCount).toBe(1);
        expect(mockAccelerator.setThrust.callCount).toBe(0);
    });
});
