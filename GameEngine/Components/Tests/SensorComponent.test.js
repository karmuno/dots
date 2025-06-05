import SensorComponent from '../SensorComponent.js';
import Entity from '../../Core/Entity.js';

// Mock Entity for testing
// jest.mock('../../Core/Entity.js'); // Removed for now

describe('SensorComponent', () => {
    let sensor;
    let mockEntity1, mockEntity2;

    beforeEach(() => {
        sensor = new SensorComponent(50, ['Dit']);
        mockEntity1 = new Entity();
        mockEntity1.id = '1';
        mockEntity2 = new Entity();
        mockEntity2.id = '2';
    });

    test('constructor initializes properties correctly', () => {
        expect(sensor.range).toBe(50);
        expect(sensor.filterTypes).toEqual(['Dit']);
        expect(sensor.detectedEntities).toEqual([]);
    });

    test('getRange returns the current range', () => {
        expect(sensor.getRange()).toBe(50);
    });

    test('setRange updates the range', () => {
        sensor.setRange(100);
        expect(sensor.range).toBe(100);
    });

    test('getDetectedEntities returns a copy of detectedEntities', () => {
        sensor.addDetectedEntity(mockEntity1);
        const detected = sensor.getDetectedEntities();
        expect(detected).toEqual([mockEntity1]);
        detected.push(mockEntity2); // Modify the returned array
        expect(sensor.detectedEntities).toEqual([mockEntity1]); // Original should be unchanged
    });

    test('clearDetections empties the detectedEntities list', () => {
        sensor.addDetectedEntity(mockEntity1);
        sensor.clearDetections();
        expect(sensor.detectedEntities).toEqual([]);
    });

    test('addDetectedEntity adds an entity if not already present', () => {
        sensor.addDetectedEntity(mockEntity1);
        expect(sensor.detectedEntities).toContain(mockEntity1);
        sensor.addDetectedEntity(mockEntity1); // Add same entity again
        expect(sensor.detectedEntities.length).toBe(1); // Should not add duplicates
    });

    test('addDetectedEntity does not add null or undefined entities', () => {
        sensor.addDetectedEntity(null);
        sensor.addDetectedEntity(undefined);
        expect(sensor.detectedEntities.length).toBe(0);
    });

    test('removeDetectedEntity removes an entity by ID', () => {
        sensor.addDetectedEntity(mockEntity1);
        sensor.addDetectedEntity(mockEntity2);
        sensor.removeDetectedEntity('1');
        expect(sensor.detectedEntities).not.toContain(mockEntity1);
        expect(sensor.detectedEntities).toContain(mockEntity2);
    });

    test('setFilter updates filterTypes', () => {
        sensor.setFilter(['Dot']);
        expect(sensor.filterTypes).toEqual(['Dot']);
    });

    test('setFilter handles non-array input by defaulting to empty array', () => {
        sensor.setFilter('NotAnArray');
        expect(sensor.filterTypes).toEqual([]);
        sensor.setFilter(null);
        expect(sensor.filterTypes).toEqual([]);
    });
});
