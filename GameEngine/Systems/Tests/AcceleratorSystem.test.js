import AcceleratorSystem from '../AcceleratorSystem.js';
import World from '../../Core/World.js';
import Entity from '../../Core/Entity.js';
import AcceleratorComponent from '../../Components/AcceleratorComponent.js';
import MovementComponent from '../../Components/Movement.js'; // Corrected path
import EnergyComponent from '../../Components/EnergyComponent.js';

// jest.mock('../../Core/World.js');
// jest.mock('../../Core/Entity.js');
// jest.mock('../../Components/AcceleratorComponent.js');
// jest.mock('../../Components/Movement.js'); // Corrected mock path
// jest.mock('../../Components/EnergyComponent.js');

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
    // Add a way to get the first call's arguments, similar to toHaveBeenCalledWith
    mock.getCall = (index) => mock.calls[index];
    return mock;
};

describe('AcceleratorSystem', () => {
    let acceleratorSystem;
    let mockWorld;
    let mockEntity;
    let mockAccelerator;
    let mockMovement;
    let mockEnergy;

    beforeEach(() => {
        acceleratorSystem = new AcceleratorSystem();
        mockWorld = new World();
        mockEntity = new Entity();

        mockAccelerator = new AcceleratorComponent(100, 10);
        mockAccelerator.isThrusting = true;
        mockAccelerator.currentThrust = { x: 10, y: 0 };
        mockAccelerator.getEnergyCost = createManualMock().mockReturnValue(10);
        mockAccelerator.stopThrust = createManualMock();

        mockMovement = new MovementComponent(0, 0); // initial velocityX, velocityY
        mockEnergy = new EnergyComponent(100, 100); // initialEnergy, maxEnergy
        mockEnergy.decreaseEnergy = createManualMock();
        mockEnergy.getEnergy = createManualMock().mockReturnValue(50); // Current energy

        mockEntity.getComponent = createManualMock(ComponentType => {
            if (ComponentType === AcceleratorComponent) return mockAccelerator;
            if (ComponentType === MovementComponent) return mockMovement;
            if (ComponentType === EnergyComponent) return mockEnergy;
            return null;
        });
        mockEntity.hasComponent = createManualMock(ComponentType => {
            // Default to true for EnergyComponent for relevant tests, can be overridden per test
            return ComponentType === EnergyComponent;
        });

        mockWorld.getEntitiesByComponents = createManualMock().mockReturnValue([mockEntity]);
    });

    test('update applies thrust to movement when thrusting', () => {
        acceleratorSystem.update(mockWorld, 1.0); // deltaTime = 1.0

        expect(mockMovement.velocityX).toBe(10); // initial 0 + 10 * 1.0
        expect(mockMovement.velocityY).toBe(0);  // initial 0 + 0 * 1.0
    });

    test('update consumes energy when thrusting and entity has EnergyComponent', () => {
        mockEntity.hasComponent = createManualMock().mockReturnValue(true);
        acceleratorSystem.update(mockWorld, 1.0);

        expect(mockEnergy.decreaseEnergy.callCount).toBe(1);
        expect(mockEnergy.decreaseEnergy.getCall(0)[0]).toBe(10 * 1.0); // energyCost * deltaTime
    });

    test('update does not consume energy if entity lacks EnergyComponent', () => {
        mockEntity.hasComponent = createManualMock().mockReturnValue(false); // No EnergyComponent
        acceleratorSystem.update(mockWorld, 1.0);

        expect(mockEnergy.decreaseEnergy.callCount).toBe(0);
    });

    test('update does not apply thrust if not thrusting', () => {
        mockAccelerator.isThrusting = false;
        acceleratorSystem.update(mockWorld, 1.0);

        expect(mockMovement.velocityX).toBe(0); // Should remain initial 0
        expect(mockMovement.velocityY).toBe(0);  // Should remain initial 0
        expect(mockEnergy.decreaseEnergy.callCount).toBe(0);
    });

    test('update stops thrust if energy runs out', () => {
        mockEntity.hasComponent = createManualMock().mockReturnValue(true); // Has energy component
        mockEnergy.getEnergy.mockReturnValue(0); // Energy is zero or less

        acceleratorSystem.update(mockWorld, 1.0);

        expect(mockAccelerator.stopThrust.callCount).toBe(1);
    });

    test('update handles multiple entities', () => {
        const mockEntity2 = new Entity(); // Uses manual mock Entity
        const mockAccelerator2 = new AcceleratorComponent(50, 5);
        mockAccelerator2.isThrusting = true;
        mockAccelerator2.currentThrust = { x: 0, y: 5 };
        mockAccelerator2.getEnergyCost = createManualMock().mockReturnValue(5);
        const mockMovement2 = new MovementComponent(0,0);

        mockEntity2.getComponent = createManualMock(ComponentType => {
            if (ComponentType === AcceleratorComponent) return mockAccelerator2;
            if (ComponentType === MovementComponent) return mockMovement2;
            return null;
        });
        mockEntity2.hasComponent = createManualMock().mockReturnValue(false); // No energy component for simplicity

        mockWorld.getEntitiesByComponents.mockReturnValue([mockEntity, mockEntity2]);

        acceleratorSystem.update(mockWorld, 1.0);

        expect(mockMovement.velocityX).toBe(10);
        expect(mockMovement2.velocityY).toBe(5);
    });
});
