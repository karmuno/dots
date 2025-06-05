import EatWhenHungryComponent from '../EatWhenHungryComponent.js';
import Entity from '../../Core/Entity.js';

// Mock Entity for testing
// jest.mock('../../Core/Entity.js'); // Removed as it was causing issues


describe('EatWhenHungryComponent', () => {
    let eatWhenHungry;
    let mockTargetEntity;

    beforeEach(() => {
        eatWhenHungry = new EatWhenHungryComponent(30); // Hunger threshold of 30
        mockTargetEntity = new Entity(); // Mock an entity
    });

    test('constructor initializes properties correctly', () => {
        expect(eatWhenHungry.hungerThreshold).toBe(30);
        expect(eatWhenHungry.isActive).toBe(true);
        expect(eatWhenHungry.targetEntity).toBeNull();
    });

    test('getHungerThreshold returns the current threshold', () => {
        expect(eatWhenHungry.getHungerThreshold()).toBe(30);
    });

    test('setHungerThreshold updates the threshold', () => {
        eatWhenHungry.setHungerThreshold(20);
        expect(eatWhenHungry.hungerThreshold).toBe(20);
    });

    test('isHungry returns true when energy is below threshold and component is active', () => {
        eatWhenHungry.setActive(true);
        expect(eatWhenHungry.isHungry(29)).toBe(true);
        expect(eatWhenHungry.isHungry(10)).toBe(true);
    });

    test('isHungry returns false when energy is at or above threshold', () => {
        eatWhenHungry.setActive(true);
        expect(eatWhenHungry.isHungry(30)).toBe(false);
        expect(eatWhenHungry.isHungry(50)).toBe(false);
    });

    test('isHungry returns false when component is inactive, even if energy is low', () => {
        eatWhenHungry.setActive(false);
        expect(eatWhenHungry.isHungry(20)).toBe(false);
    });

    test('setActive updates the isActive state', () => {
        eatWhenHungry.setActive(false);
        expect(eatWhenHungry.isActive).toBe(false);
        eatWhenHungry.setActive(true);
        expect(eatWhenHungry.isActive).toBe(true);
    });

    test('setTarget updates the targetEntity', () => {
        eatWhenHungry.setTarget(mockTargetEntity);
        expect(eatWhenHungry.targetEntity).toBe(mockTargetEntity);
    });

    test('getTarget returns the current targetEntity', () => {
        eatWhenHungry.setTarget(mockTargetEntity);
        expect(eatWhenHungry.getTarget()).toBe(mockTargetEntity);
    });

    test('clearTarget sets targetEntity to null', () => {
        eatWhenHungry.setTarget(mockTargetEntity);
        eatWhenHungry.clearTarget();
        expect(eatWhenHungry.targetEntity).toBeNull();
    });
});
