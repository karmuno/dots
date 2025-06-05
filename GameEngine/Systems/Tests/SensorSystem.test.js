import SensorSystem from '../SensorSystem.js';
import World from '../../Core/World.js';
import Entity from '../../Core/Entity.js';
import SensorComponent from '../../Components/SensorComponent.js';
import Transform from '../../Components/Transform.js';

// jest.mock('../../Core/World.js');
// jest.mock('../../Core/Entity.js', () => {
//     let idCounter = 0;
//     return jest.fn().mockImplementation(() => {
//         const entity = {
//             id: `mock-entity-${idCounter++}`, // Ensure unique IDs for entities
//             hasComponent: jest.fn(),
//             getComponent: jest.fn(),
//             // Mock constructor.name for type filtering
//             constructor: { name: 'MockEntity' }
//         };
//         // Default mock implementations
//         entity.hasComponent.mockImplementation(CompType => {
//             if (CompType === Transform) return true; // Assume all entities have Transform for simplicity
//             return false;
//         });
//         entity.getComponent.mockImplementation(CompType => {
//             if (CompType === Transform) return { position: { x: 0, y: 0 } }; // Default position
//             return null;
//         });
//         return entity;
//     });
// });
// jest.mock('../../Components/SensorComponent.js');
// jest.mock('../../Components/Transform.js');

// Manual mock function helper
const createManualMock = (implementation) => {
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

describe('SensorSystem', () => {
    let sensorSystem;
    let mockWorld;
    let entityWithSensor;
    let mockSensorComponent;
    let entityToDetect1, entityToDetect2; // Will be instances of MockDit, MockDot

    // Helper classes for testing types
    class MockDit extends Entity { constructor(id) { super(id); this.getComponent = createManualMock(); this.hasComponent = createManualMock().mockReturnValue(true); } }
    class MockDot extends Entity { constructor(id) { super(id); this.getComponent = createManualMock(); this.hasComponent = createManualMock().mockReturnValue(true); } }
    class SensorEntity extends Entity { constructor(id) { super(id); this.getComponent = createManualMock(); this.hasComponent = createManualMock().mockReturnValue(true); } }


    beforeEach(() => {
        sensorSystem = new SensorSystem();
        mockWorld = new World();

        // Entity with the sensor
        entityWithSensor = new SensorEntity("sensorEntity");

        mockSensorComponent = new SensorComponent(50, []);
        mockSensorComponent.getRange = createManualMock().mockReturnValue(50);
        mockSensorComponent.clearDetections = createManualMock();
        mockSensorComponent.addDetectedEntity = createManualMock();
        mockSensorComponent.filterTypes = [];

        const sensorTransform = new Transform(0, 0);
        entityWithSensor.getComponent.mockImplementation(ComponentType => {
            if (ComponentType === SensorComponent) return mockSensorComponent;
            if (ComponentType === Transform) return sensorTransform;
            return null;
        });
        entityWithSensor.hasComponent.mockImplementation(ComponentType => {
             return ComponentType === SensorComponent || ComponentType === Transform;
        });


        // Entities to be detected
        entityToDetect1 = new MockDit("detectedEntity1");
        const transform1 = new Transform(10, 0);
        entityToDetect1.getComponent.mockReturnValue(transform1);
        // .constructor.name is automatically 'MockDit'

        entityToDetect2 = new MockDot("detectedEntity2");
        const transform2 = new Transform(100, 0);
        entityToDetect2.getComponent.mockReturnValue(transform2);
        // .constructor.name is automatically 'MockDot'

        mockWorld.getEntitiesByComponents = createManualMock().mockReturnValue([entityWithSensor]);
        mockWorld.getEntities = createManualMock().mockReturnValue([entityWithSensor, entityToDetect1, entityToDetect2]);
    });

    test('update clears previous detections', () => {
        sensorSystem.update(mockWorld, 0.1);
        expect(mockSensorComponent.clearDetections.callCount).toBe(1);
    });

    test('detects entities within range', () => {
        sensorSystem.update(mockWorld, 0.1);
        expect(mockSensorComponent.addDetectedEntity.calls).toContainEqual([entityToDetect1]);
        expect(mockSensorComponent.addDetectedEntity.calls).not.toContainEqual([entityToDetect2]);
    });

    test('does not detect self', () => {
        sensorSystem.update(mockWorld, 0.1);
        expect(mockSensorComponent.addDetectedEntity.calls).not.toContainEqual([entityWithSensor]);
    });

    test('applies type filter if specified', () => {
        mockSensorComponent.filterTypes = ['MockDit']; // Filter for MockDit type
        sensorSystem.update(mockWorld, 0.1);
        expect(mockSensorComponent.addDetectedEntity.calls).toContainEqual([entityToDetect1]);
        expect(mockSensorComponent.addDetectedEntity.calls).not.toContainEqual([entityToDetect2]);
    });

    test('detects all types if filter is empty', () => {
        mockSensorComponent.filterTypes = [];
        const inRangeTransform = new Transform(20,0); // Re-create to avoid issues with stale mock
        entityToDetect2.getComponent.mockReturnValue(inRangeTransform);
        mockWorld.getEntities.mockReturnValue([entityWithSensor, entityToDetect1, entityToDetect2]);

        sensorSystem.update(mockWorld, 0.1);
        expect(mockSensorComponent.addDetectedEntity.calls).toContainEqual([entityToDetect1]);
        expect(mockSensorComponent.addDetectedEntity.calls).toContainEqual([entityToDetect2]);
    });

    test('does not detect entities without Transform component', () => {
        entityToDetect1.hasComponent.mockImplementation(CompType => CompType !== Transform);
        sensorSystem.update(mockWorld, 0.1);
        expect(mockSensorComponent.addDetectedEntity.calls).not.toContainEqual([entityToDetect1]);
    });
});
