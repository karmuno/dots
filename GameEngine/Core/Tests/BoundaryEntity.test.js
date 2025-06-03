import BoundaryEntity from '../../Entities/BoundaryEntity.js';
import RadiusComponent from '../../Components/RadiusComponent.js';
import ColliderComponent from '../../Components/ColliderComponent.js';
import GrowComponent from '../../Components/GrowComponent.js';

describe('BoundaryEntity', () => {
  let boundary;

  beforeEach(() => {
    // Create a new BoundaryEntity before each test
    boundary = new BoundaryEntity(200, 15, 500); // Custom values for testing
  });

  test('constructor creates an entity with an ID', () => {
    expect(boundary.id).toBeDefined();
    // Entity IDs are typically numbers
    expect(typeof boundary.id).toBe('number');
  });

  test('constructor adds RadiusComponent correctly', () => {
    expect(boundary.hasComponent('RadiusComponent')).toBe(true);
    const radiusComp = boundary.getComponent('RadiusComponent');
    expect(radiusComp).toBeInstanceOf(RadiusComponent);
    expect(radiusComp.radius).toBe(200); // Initial radius from constructor
  });

  test('constructor adds ColliderComponent correctly', () => {
    expect(boundary.hasComponent('ColliderComponent')).toBe(true);
    expect(boundary.getComponent('ColliderComponent')).toBeInstanceOf(ColliderComponent);
  });

  test('constructor adds GrowComponent correctly', () => {
    expect(boundary.hasComponent('GrowComponent')).toBe(true);
    const growComp = boundary.getComponent('GrowComponent');
    expect(growComp).toBeInstanceOf(GrowComponent);
    expect(growComp.growthRate).toBe(15); // Growth rate from constructor
    expect(growComp.interval).toBe(500); // Interval from constructor
  });

  test('uses default values if not provided in constructor', () => {
    const defaultBoundary = new BoundaryEntity();
    const radiusComp = defaultBoundary.getComponent('RadiusComponent');
    expect(radiusComp.radius).toBe(100); // Default initialRadius for BoundaryEntity

    const growComp = defaultBoundary.getComponent('GrowComponent');
    expect(growComp.growthRate).toBe(20); // Default growthRate for BoundaryEntity
    expect(growComp.interval).toBe(10000); // Default interval for BoundaryEntity
  });
});
