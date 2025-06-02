import UISystem from '../UISystem.js'; // Adjust path as needed

// Mock Components
class MockInspectableComponent {}
class MockAppearanceComponent {
    constructor(color) {
        this.color = color;
    }
}

describe('UISystem.selectPreviousInspectableEntity', () => {
    let worldMock;
    let dotSheetMock;
    let colorPickerMock;
    let uiSystem;

    let entity1, entity2, entity3, nonInspectableEntity;

    beforeEach(() => {
        worldMock = {
            entities: {},
            selectedEntity: null,
        };
        dotSheetMock = {
            displayEntityInfo: jest.fn(),
        };
        colorPickerMock = {
            setColor: jest.fn(),
        };
        uiSystem = new UISystem(worldMock, dotSheetMock, colorPickerMock);

        // Mock Entities
        entity1 = {
            id: 'e1',
            components: {
                InspectableComponent: new MockInspectableComponent(),
                Appearance: new MockAppearanceComponent('#FF0000'), // Red
            },
        };
        entity2 = {
            id: 'e2',
            components: {
                InspectableComponent: new MockInspectableComponent(),
                Appearance: new MockAppearanceComponent('#00FF00'), // Green
            },
        };
        entity3 = {
            id: 'e3',
            components: {
                InspectableComponent: new MockInspectableComponent(),
                Appearance: new MockAppearanceComponent('#0000FF'), // Blue
            },
        };
        nonInspectableEntity = {
            id: 'ne1',
            components: {
                Appearance: new MockAppearanceComponent('#FFFFFF'), // White
            },
        };
        
        // Reset console.log/warn mocks if needed (Jest does this automatically)
        global.console.log = jest.fn();
        global.console.warn = jest.fn();
    });

    test('should do nothing and log if no inspectable entities exist', () => {
        worldMock.entities = { nonInspectableEntity };
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBeNull();
        expect(dotSheetMock.displayEntityInfo).not.toHaveBeenCalled();
        expect(colorPickerMock.setColor).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith("UISystem: No inspectable entities found.");
    });

    test('should select the last inspectable entity if none is currently selected', () => {
        worldMock.entities = { entity1, entity2, entity3 };
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity3);
        expect(dotSheetMock.displayEntityInfo).toHaveBeenCalledWith(entity3);
        expect(colorPickerMock.setColor).toHaveBeenCalledWith(0, 0, 255, true);
    });

    test('should select the last inspectable entity if the first is currently selected', () => {
        worldMock.entities = { entity1, entity2, entity3 };
        worldMock.selectedEntity = entity1;
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity3);
    });

    test('should select the previous inspectable entity in the list', () => {
        worldMock.entities = { entity1, entity2, entity3 };
        worldMock.selectedEntity = entity2;
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity1);
        expect(dotSheetMock.displayEntityInfo).toHaveBeenCalledWith(entity1);
        expect(colorPickerMock.setColor).toHaveBeenCalledWith(255, 0, 0, true);
    });
    
    test('should select the second to last inspectable entity if the last is currently selected', () => {
        worldMock.entities = { entity1, entity2, entity3 };
        worldMock.selectedEntity = entity3;
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity2);
    });

    test('should handle a single inspectable entity by re-selecting it', () => {
        worldMock.entities = { entity1 };
        worldMock.selectedEntity = null; // Start with no selection
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity1);
        
        uiSystem.selectPreviousInspectableEntity(); // Call again
        expect(worldMock.selectedEntity).toBe(entity1);
        expect(dotSheetMock.displayEntityInfo).toHaveBeenCalledTimes(2);
        expect(colorPickerMock.setColor).toHaveBeenCalledTimes(2);
    });

    test('should ignore non-inspectable entities in the cycle', () => {
        worldMock.entities = { entity1, nonInspectableEntity, entity2 }; // entity2 is "after" nonInspectableEntity
        worldMock.selectedEntity = entity1;
        uiSystem.selectPreviousInspectableEntity(); // Should wrap around to entity2
        expect(worldMock.selectedEntity).toBe(entity2);
    });
    
    test('should select last inspectable entity if selected entity is not in inspectable list', () => {
        const anotherNonInspectable = { id: 'ne2', components: { Appearance: new MockAppearanceComponent('#000000') }};
        worldMock.entities = { entity1, entity2, anotherNonInspectable };
        worldMock.selectedEntity = anotherNonInspectable;
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity2); // last of (e1, e2)
    });

    test('should correctly parse color and call colorPicker.setColor', () => {
        worldMock.entities = { entity1 }; // Color #FF0000
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity1);
        expect(colorPickerMock.setColor).toHaveBeenCalledWith(255, 0, 0, true); // r, g, b, silent
    });

    test('should warn if world or entities are not available', () => {
        uiSystem.world = null;
        uiSystem.selectPreviousInspectableEntity();
        expect(console.warn).toHaveBeenCalledWith("UISystem: World or entities not available.");
        expect(dotSheetMock.displayEntityInfo).not.toHaveBeenCalled();
    });
    
    test('should warn if dotSheet or displayEntityInfo is not available', () => {
        worldMock.entities = { entity1 };
        uiSystem.dotSheet = null;
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity1); // Selection should still happen
        expect(console.warn).toHaveBeenCalledWith("UISystem: DotSheet or displayEntityInfo method not available.");
        // colorPicker should still be called if available
        expect(colorPickerMock.setColor).toHaveBeenCalledWith(255,0,0, true);
    });

    test('should not call colorPicker.setColor if selected entity has no Appearance component', () => {
        const noAppearanceEntity = { id: 'noAppearance', components: { InspectableComponent: new MockInspectableComponent() }};
        worldMock.entities = { noAppearanceEntity };
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(noAppearanceEntity);
        expect(dotSheetMock.displayEntityInfo).toHaveBeenCalledWith(noAppearanceEntity);
        expect(colorPickerMock.setColor).not.toHaveBeenCalled();
    });
    
    test('should not call colorPicker.setColor if colorPicker is not available', () => {
        worldMock.entities = { entity1 };
        uiSystem.colorPicker = null;
        uiSystem.selectPreviousInspectableEntity();
        expect(worldMock.selectedEntity).toBe(entity1);
        expect(dotSheetMock.displayEntityInfo).toHaveBeenCalledWith(entity1);
        expect(colorPickerMock.setColor).not.toHaveBeenCalled(); // Original mock shouldn't be called
    });
});
