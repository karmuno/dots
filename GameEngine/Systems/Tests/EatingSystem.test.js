import EatingSystem from '../EatingSystem.js';
import World from '../../Core/World.js';
import Dot from '../../Entities/Dot.js';
import Dit from '../../Entities/Dit.js';
import MetabolizerComponent from '../../Components/MetabolizerComponent.js';
import NutrientComponent from '../../Components/NutrientComponent.js';
import Transform from '../../Components/Transform.js';
import ColliderComponent from '../../Components/ColliderComponent.js';

describe('EatingSystem', () => {
  let world;
  let eatingSystem;
  let dot;
  let dit;

  beforeEach(() => {
    world = new World();
    eatingSystem = new EatingSystem(world);

    // Helper to create a Dot with specific metabolizer options
    const createDot = (id, x, y, metabolizerOpts = {}) => {
      const newDot = new Dot(id, x, y, 0, 0, '#FF0000', {}, metabolizerOpts);
      // Ensure it has necessary components for the system
      if (!newDot.hasComponent('MetabolizerComponent')) newDot.addComponent(new MetabolizerComponent(metabolizerOpts));
      if (!newDot.hasComponent('Transform')) newDot.addComponent(new Transform(x,y));
      if (!newDot.hasComponent('ColliderComponent')) newDot.addComponent(new ColliderComponent({width:3, height:3}));
      world.addEntity(newDot);
      return newDot;
    };

    // Helper to create a Dit with specific nutrient options
    const createDit = (id, x, y, nutrientOpts = {}) => {
      const newDit = new Dit(id, x, y, nutrientOpts);
       // Ensure it has necessary components for the system
      if (!newDit.hasComponent('NutrientComponent')) newDit.addComponent(new NutrientComponent(nutrientOpts));
      if (!newDit.hasComponent('Transform')) newDit.addComponent(new Transform(x,y));
      if (!newDit.hasComponent('ColliderComponent')) newDit.addComponent(new ColliderComponent({width:1, height:1}));
      world.addEntity(newDit);
      return newDit;
    };

    // Default Dot and Dit for basic tests
    // Dot positioned at (0,0), Dit positioned at (0,0) for collision
    dot = createDot('dot1', 0, 0, { maxStorage: 100, maxRedAbsorption: 10, maxGreenAbsorption: 10, maxBlueAbsorption: 10 });
    dit = createDit('dit1', 0, 0, { red: 20, green: 20, blue: 20 });
  });

  test('Dot should consume nutrients from Dit upon collision', () => {
    const dotMetabolizer = dot.getComponent('MetabolizerComponent');
    const ditNutrient = dit.getComponent('NutrientComponent');

    eatingSystem.update(0.1); // deltaTime shouldn't matter here

    expect(dotMetabolizer.getCurrentRedStored()).toBe(10); // Absorbed up to maxRedAbsorption
    expect(dotMetabolizer.getCurrentGreenStored()).toBe(10);
    expect(dotMetabolizer.getCurrentBlueStored()).toBe(10);

    // Original dit should be removed, and a waste dit created
    expect(world.entities['dit1']).toBeUndefined();

    const wasteDits = Object.values(world.entities).filter(e => e.constructor.name === 'Dit' && e.id.startsWith('waste_dit1'));
    expect(wasteDits.length).toBe(1);
    const wasteDit = wasteDits[0];
    const wasteNutrient = wasteDit.getComponent('NutrientComponent');
    expect(wasteNutrient.getRed()).toBe(10); // Remaining nutrients
    expect(wasteNutrient.getGreen()).toBe(10);
    expect(wasteNutrient.getBlue()).toBe(10);
  });

  test('Dot should not consume if its storage is full', () => {
    const dotMetabolizer = dot.getComponent('MetabolizerComponent');
    dotMetabolizer.setCurrentRedStored(dotMetabolizer.getMaxStorage()); // Fill storage

    eatingSystem.update(0.1);

    expect(dotMetabolizer.getCurrentRedStored()).toBe(dotMetabolizer.getMaxStorage());
    // Ensure no more nutrients were added
    expect(dotMetabolizer.getTotalStoredNutrients()).toBe(dotMetabolizer.getMaxStorage());

    // Dit should still exist with original nutrients
    const existingDit = world.entities['dit1'];
    expect(existingDit).toBeDefined();
    expect(existingDit.getComponent('NutrientComponent').getRed()).toBe(20);
  });

  test('Dit should be completely consumed if its nutrients are less than Dot absorption capacity', () => {
    world.removeEntity('dit1'); // remove default dit
    dit = new Dit('dit2', 0, 0, { red: 5, green: 5, blue: 5 });
    world.addEntity(dit);

    eatingSystem.update(0.1);

    const dotMetabolizer = dot.getComponent('MetabolizerComponent');
    expect(dotMetabolizer.getCurrentRedStored()).toBe(5);
    expect(dotMetabolizer.getCurrentGreenStored()).toBe(5);
    expect(dotMetabolizer.getCurrentBlueStored()).toBe(5);

    expect(world.entities['dit2']).toBeUndefined(); // Original dit removed
    // No waste dit should be created
    const wasteDits = Object.values(world.entities).filter(e => e.constructor.name === 'Dit' && e.id.startsWith('waste_'));
    expect(wasteDits.length).toBe(0);
  });

  test('No consumption if Dot and Dit do not collide', () => {
    const ditTransform = dit.getComponent('Transform');
    ditTransform.position.x = 100; // Move Dit far away

    eatingSystem.update(0.1);

    const dotMetabolizer = dot.getComponent('MetabolizerComponent');
    expect(dotMetabolizer.getTotalStoredNutrients()).toBe(0);
    expect(world.entities['dit1']).toBeDefined(); // Dit still exists
  });

  test('Dot should only absorb up to available storage space', () => {
    const dotMetabolizer = dot.getComponent('MetabolizerComponent');
    // Max storage 100. Absorption per channel 10. Dit has 20,20,20.
    // Fill up storage to 90. Only 10 space left.
    dotMetabolizer.addNutrients(30,30,30); // 90 stored
    expect(dotMetabolizer.getTotalStoredNutrients()).toBe(90);

    eatingSystem.update(0.1);

    // Dot tries to absorb 10,10,10 (total 30) but only 10 space.
    // addNutrients logic: scale = 10/30. r=floor(10*0.33)=3, g=3, b=3. Total 9. Remainder 1. r=4.
    // So, 4 red, 3 green, 3 blue should be added.
    expect(dotMetabolizer.getCurrentRedStored()).toBe(30 + 4); // 30 initial + 4 absorbed
    expect(dotMetabolizer.getCurrentGreenStored()).toBe(30 + 3); // 30 initial + 3 absorbed
    expect(dotMetabolizer.getCurrentBlueStored()).toBe(30 + 3); // 30 initial + 3 absorbed
    expect(dotMetabolizer.getTotalStoredNutrients()).toBe(100); // Storage is now full

    expect(world.entities['dit1']).toBeUndefined(); // Original dit removed
    const wasteDits = Object.values(world.entities).filter(e => e.constructor.name === 'Dit' && e.id.startsWith('waste_dit1'));
    expect(wasteDits.length).toBe(1);
    const wasteNutrient = wasteDits[0].getComponent('NutrientComponent');
    expect(wasteNutrient.getRed()).toBe(20 - 4); // Dit had 20, Dot absorbed 4
    expect(wasteNutrient.getGreen()).toBe(20 - 3); // Dit had 20, Dot absorbed 3
    expect(wasteNutrient.getBlue()).toBe(20 - 3); // Dit had 20, Dot absorbed 3
  });

  test('Waste Dit should be created with correct remaining nutrients', () => {
    // Dit has 20,20,20. Dot absorbs 10,10,10. Waste should have 10,10,10. (This is covered by the first test)
    // Let's try another variation: Dit has more than absorption capacity in one channel.
    world.removeEntity('dit1');
    dit = new Dit('dit3', 0, 0, { red: 25, green: 8, blue: 5 }); // Dot max absorption is 10,10,10
    world.addEntity(dit);

    eatingSystem.update(0.1);

    const dotMetabolizer = dot.getComponent('MetabolizerComponent');
    expect(dotMetabolizer.getCurrentRedStored()).toBe(10); // Absorbed max 10 red
    expect(dotMetabolizer.getCurrentGreenStored()).toBe(8);  // Absorbed all 8 green
    expect(dotMetabolizer.getCurrentBlueStored()).toBe(5);   // Absorbed all 5 blue

    expect(world.entities['dit3']).toBeUndefined();
    const wasteDits = Object.values(world.entities).filter(e => e.constructor.name === 'Dit' && e.id.startsWith('waste_dit3'));
    expect(wasteDits.length).toBe(1);
    const wasteNutrient = wasteDits[0].getComponent('NutrientComponent');
    expect(wasteNutrient.getRed()).toBe(25 - 10); // 15 red remaining
    expect(wasteNutrient.getGreen()).toBe(0);
    expect(wasteNutrient.getBlue()).toBe(0);
  });

  test('System should handle multiple Dots and Dits correctly', () => {
    // Dit1 (0,0) {20,20,20}
    // Dot1 (0,0) {maxAbs:10, maxStore:100} -> will eat from Dit1

    // Add Dot2 at (10,10) - no collision
    const dot2 = new Dot('dot2', 10, 10, 0, 0, '#00FF00', {}, { maxRedAbsorption: 5, maxStorage: 50 });
    world.addEntity(dot2);

    // Add Dit2 at (0,0) - also colliding with Dot1
    const dit2 = new Dit('dit2', 0, 0, { red: 5, green: 5, blue: 5 });
    world.addEntity(dit2);

    eatingSystem.update(0.1);

    const dot1Metabolizer = dot.getComponent('MetabolizerComponent');
    // Dot1 could have eaten from dit1 OR dit2. The system iterates dits for each dot.
    // If dot1 processes dit1 first: absorbs 10,10,10. dit1 becomes waste (10,10,10).
    // Then dot1 (storage now 30/100) processes dit2: absorbs 5,5,5. dit2 is fully consumed.
    // Total for dot1: 15,15,15

    // If dot1 processes dit2 first: absorbs 5,5,5. dit2 is fully consumed.
    // Then dot1 (storage now 15/100) processes dit1: absorbs 10,10,10. dit1 becomes waste (10,10,10).
    // Total for dot1: 15,15,15
    // So order of processing Dits for a single Dot doesn't change total intake if enough storage.

    expect(dot1Metabolizer.getCurrentRedStored()).toBe(15);
    expect(dot1Metabolizer.getCurrentGreenStored()).toBe(15);
    expect(dot1Metabolizer.getCurrentBlueStored()).toBe(15);

    expect(world.entities['dit1']).toBeUndefined(); // Original dit1 removed (became waste)
    expect(world.entities['dit2']).toBeUndefined(); // Original dit2 removed (fully consumed)

    const wasteDits = Object.values(world.entities).filter(e => e.constructor.name === 'Dit' && e.id.startsWith('waste_'));
    expect(wasteDits.length).toBe(1); // Only one waste dit from dit1
    expect(wasteDits[0].getComponent('NutrientComponent').getRed()).toBe(10);


    const dot2Metabolizer = dot2.getComponent('MetabolizerComponent');
    expect(dot2Metabolizer.getTotalStoredNutrients()).toBe(0); // Dot2 didn't collide
  });

    test('Waste Dit should have its appearance updated', (done) => {
        const originalDitColor = dit.getComponent('Appearance').getColor();

        // Mock or spy on updateAppearanceColor if possible, or check color directly
        // For this test, we'll check the color of the waste dit after creation.
        // Dit(20,20,20), Dot absorbs (10,10,10). Waste has (10,10,10)

        eatingSystem.update(0.1);

        const wasteDits = Object.values(world.entities).filter(e => e.constructor.name === 'Dit' && e.id.startsWith('waste_dit1'));
        expect(wasteDits.length).toBe(1);
        const wasteDit = wasteDits[0];
        const wasteDitAppearance = wasteDit.getComponent('Appearance');
        const wasteNutrient = wasteDit.getComponent('NutrientComponent');

        // Expected color for (10,10,10)
        // Helper from Dit.js: rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase(); }
        const expectedWasteColor = "#0A0A0A";

        expect(wasteNutrient.getRed()).toBe(10); // Confirm nutrients first
        expect(wasteNutrient.getGreen()).toBe(10);
        expect(wasteNutrient.getBlue()).toBe(10);

        // The Dit constructor should set the color based on initial nutrients.
        // The EatingSystem creates a *new* Dit for waste.
        expect(wasteDitAppearance.getColor()).toBe(expectedWasteColor);
        expect(wasteDitAppearance.getColor()).not.toBe(originalDitColor); // Ensure it's different
        done();
    });

});
