import AcceleratorComponent from '../AcceleratorComponent.js';

describe('AcceleratorComponent', () => {
    let accelerator;

    beforeEach(() => {
        accelerator = new AcceleratorComponent(100, 10);
    });

    test('constructor initializes properties correctly', () => {
        expect(accelerator.thrustPower).toBe(100);
        expect(accelerator.energyCost).toBe(10);
        expect(accelerator.currentThrust).toEqual({ x: 0, y: 0 });
        expect(accelerator.isThrusting).toBe(false);
    });

    test('setThrust sets thrust and updates isThrusting', () => {
        accelerator.setThrust(1, 0, 50);
        expect(accelerator.currentThrust.x).toBeCloseTo(50);
        expect(accelerator.currentThrust.y).toBeCloseTo(0);
        expect(accelerator.isThrusting).toBe(true);
    });

    test('setThrust respects thrustPower limit', () => {
        accelerator.setThrust(1, 0, 150); // Try to set power above thrustPower
        expect(accelerator.currentThrust.x).toBeCloseTo(100);
        expect(accelerator.isThrusting).toBe(true);
    });

    test('setThrust handles zero magnitude direction vector', () => {
        accelerator.setThrust(0, 0, 50);
        expect(accelerator.currentThrust).toEqual({ x: 0, y: 0 });
        expect(accelerator.isThrusting).toBe(false);
    });

    test('setThrust with zero power stops thrusting', () => {
        accelerator.setThrust(1, 1, 0);
        expect(accelerator.currentThrust.x).toBeCloseTo(0);
        expect(accelerator.currentThrust.y).toBeCloseTo(0);
        expect(accelerator.isThrusting).toBe(false);
    });

    test('setThrust normalizes direction', () => {
        accelerator.setThrust(2, 2, 50); // Magnitude sqrt(8)
        const expectedX = (2 / Math.sqrt(8)) * 50;
        const expectedY = (2 / Math.sqrt(8)) * 50;
        expect(accelerator.currentThrust.x).toBeCloseTo(expectedX);
        expect(accelerator.currentThrust.y).toBeCloseTo(expectedY);
        expect(accelerator.isThrusting).toBe(true);
    });

    test('stopThrust resets thrust and isThrusting', () => {
        accelerator.setThrust(1, 0, 50);
        accelerator.stopThrust();
        expect(accelerator.currentThrust).toEqual({ x: 0, y: 0 });
        expect(accelerator.isThrusting).toBe(false);
    });

    test('getThrust returns a copy of currentThrust', () => {
        accelerator.setThrust(1, 0, 50);
        const thrust = accelerator.getThrust();
        expect(thrust).toEqual({ x: 50, y: 0 });
        thrust.x = 10; // Modify the returned object
        expect(accelerator.currentThrust.x).toBeCloseTo(50); // Original should be unchanged
    });

    test('getThrustPower returns thrustPower', () => {
        expect(accelerator.getThrustPower()).toBe(100);
    });

    test('getEnergyCost returns energyCost', () => {
        expect(accelerator.getEnergyCost()).toBe(10);
    });
});
