// GameEngine/Systems/Tests/CollisionSystem.test.js
import CollisionSystem from '../CollisionSystem.js';
import { jest } from '@jest/globals';

// --- Minimal Mocks ---
class MockEntity {
    constructor(id, name = 'Entity') {
        this.id = id || Math.random().toString(36).substr(2, 9);
        this.components = new Map();
        this.constructor = { name: name };
    }
    addComponent(component) {
        this.components.set(component.constructor.name, component);
        component.entity = this;
    }
    getComponent(componentName) {
        return this.components.get(componentName);
    }
    hasComponent(componentName) {
        return this.components.has(componentName);
    }
}

class MockTransform {
    constructor(x = 0, y = 0) { this.position = { x, y }; }
    static get name() { return 'Transform'; }
}

class MockColliderComponent {
    constructor({ type, width, height, radius }) {
        this.type = type; this.width = width; this.height = height; this.radius = radius;
    }
    static get name() { return 'ColliderComponent'; }
}

class MockMovement {
    constructor(velocityX = 0, velocityY = 0) {
        this.velocityX = velocityX; this.velocityY = velocityY;
    }
    static get name() { return 'Movement'; }
}

class MockRadiusComponent {
    constructor(radius) { this.radius = radius; }
    static get name() { return 'RadiusComponent'; }
}

class MockWorld {
    constructor() { this.entities = {}; }
    addEntity(entity) { this.entities[entity.id] = entity; }
}

// --- Test Setup Helper ---
function setupSystem() {
    return new CollisionSystem();
}

function createBoundary(id, x, y, radius) {
    const boundary = new MockEntity(id, 'BoundaryEntity');
    boundary.addComponent(new MockTransform(x, y));
    boundary.addComponent(new MockColliderComponent({ type: 'circle', radius: radius }));
    boundary.addComponent(new MockRadiusComponent(radius));
    return boundary;
}

function createRectEntity(id, name = 'RectEntity', x = 0, y = 0, width = 10, height = 10, vx = 0, vy = 0) {
    const entity = new MockEntity(id, name);
    entity.addComponent(new MockTransform(x, y));
    entity.addComponent(new MockColliderComponent({ type: 'rectangle', width, height }));
    if (vx !== 0 || vy !== 0) { entity.addComponent(new MockMovement(vx, vy)); }
    return entity;
}

function createCircleEntity(id, name = 'CircleEntity', x = 0, y = 0, radius = 5, vx = 0, vy = 0) {
    const entity = new MockEntity(id, name);
    entity.addComponent(new MockTransform(x, y));
    entity.addComponent(new MockColliderComponent({ type: 'circle', radius }));
    if (vx !== 0 || vy !== 0) { entity.addComponent(new MockMovement(vx, vy)); }
    return entity;
}

describe('CollisionSystem', () => {
    describe('Dot-Boundary Collision Detection', () => {
        test('should handle various dot-boundary scenarios', () => {
            const collisionSystem = setupSystem();
            const world = new MockWorld();
            const boundary = createBoundary('boundary1', 0, 0, 50);
            world.addEntity(boundary);

            const dot3 = createRectEntity('dot3', 'Dot', 0, 0);
            const dot3Transform = dot3.getComponent('Transform');
            world.addEntity(dot3);
            collisionSystem.update(world, 0.1);
            expect(dot3Transform.position.x).toBe(0);
            expect(dot3Transform.position.y).toBe(0);

            const dot4 = createRectEntity('dot4', 'Dot', 100, 100);
            const dot4Transform = dot4.getComponent('Transform');
            world.addEntity(dot4);
            collisionSystem.update(world, 0.1);
            expect(dot4Transform.position.x).toBe(100);
            expect(dot4Transform.position.y).toBe(100);
        });
    });

    describe('Dot-Boundary Collision Response (Containment)', () => {
        test('should handle positional correction and velocity reflection', () => {
            const collisionSystem = setupSystem();

            let world1 = new MockWorld();
            let boundary1 = createBoundary('boundary1', 0, 0, 50);
            world1.addEntity(boundary1);
            let dot1 = createRectEntity('dot1', 'Dot', 52, 0, 10, 10, 1, 0);
            let dot1Transform = dot1.getComponent('Transform');
            world1.addEntity(dot1);
            collisionSystem.update(world1, 0.1);
            expect(dot1Transform.position.x).toBeCloseTo(45);
            expect(dot1Transform.position.y).toBe(0);

            let world2 = new MockWorld();
            let boundary2 = createBoundary('boundary2', 0, 0, 50);
            world2.addEntity(boundary2);
            let dot2 = createRectEntity('dot2', 'Dot', 40, 0, 10, 10, 10, 0);
            let dot2Transform = dot2.getComponent('Transform');
            let dot2Movement = dot2.getComponent('Movement');
            world2.addEntity(dot2);
            dot2Transform.position.x = 44;
            collisionSystem.update(world2, 0.1);
            expect(dot2Transform.position.x).toBeCloseTo(44);
            expect(dot2Movement.velocityX).toBeCloseTo(-10);
            expect(dot2Movement.velocityY).toBe(0);

            let world3 = new MockWorld();
            let boundary3 = createBoundary('boundary3', 100, 100, 30);
            world3.addEntity(boundary3);
            let dot3 = createRectEntity('dot3', 'Dot', 125, 100, 4, 4, 5, 0);
            let dot3Transform = dot3.getComponent('Transform');
            let dot3Movement = dot3.getComponent('Movement');
            world3.addEntity(dot3);
            collisionSystem.update(world3, 0.1);
            expect(dot3Transform.position.x).toBeCloseTo(125);
            expect(dot3Movement.velocityX).toBeCloseTo(-5);
        });
    });
    
    describe('Boundary Growth Impact', () => {
        test('Dot behavior when boundary grows', () => {
            const collisionSystem = setupSystem();
            let world = new MockWorld();

            let boundary = createBoundary('boundary1', 0, 0, 30);
            let dot = createRectEntity('dot1', 'Dot', 40, 0);
            let dotTransform = dot.getComponent('Transform');
            world.addEntity(boundary);
            world.addEntity(dot);

            collisionSystem.update(world, 0.1);
            expect(dotTransform.position.x).toBe(40);

            const radiusComp = boundary.getComponent('RadiusComponent');
            radiusComp.radius = 50;

            collisionSystem.update(world, 0.1);
            expect(dotTransform.position.x).toBe(40);

            let world2 = new MockWorld();
            let boundary2 = createBoundary('boundary2', 0, 0, 30);
            let dot2 = createRectEntity('dot2', 'Dot', 32, 0, 10, 10, 0, 0);
            let dot2Transform = dot2.getComponent('Transform');
            world2.addEntity(boundary2);
            world2.addEntity(dot2);

            collisionSystem.update(world2, 0.1);
            expect(dot2Transform.position.x).toBeCloseTo(25);

            const radiusComp2 = boundary2.getComponent('RadiusComponent');
            radiusComp2.radius = 35;
            collisionSystem.update(world2, 0.1);
            expect(dot2Transform.position.x).toBeCloseTo(25);
        });
    });

    describe('Rectangle-Rectangle Collision', () => {
        test('should handle head-on collision with velocity exchange', () => {
            const collisionSystem = setupSystem();
            let world = new MockWorld();
            let rect1 = createRectEntity('rectA', 'GenericRectA', 0, 0, 10, 10, 5, 0);
            let rect2 = createRectEntity('rectB', 'GenericRectB', 8, 0, 10, 10, -5, 0);
            let rect1Movement = rect1.getComponent('Movement');
            let rect2Movement = rect2.getComponent('Movement');
            rect1.getComponent('Transform').position.x = 8;
            rect2.getComponent('Transform').position.x = 10;
            world.addEntity(rect1);
            world.addEntity(rect2);
            collisionSystem.update(world, 0.01);
            expect(rect1Movement.velocityX).toBeCloseTo(-5);
            expect(rect2Movement.velocityX).toBeCloseTo(5);
        });
    });
    
    describe('No Interaction for Separated Entities', () => {
        test('should not alter entities that are far apart', () => {
            const collisionSystem = setupSystem();
            let world = new MockWorld();
            let boundary = createBoundary('boundaryFar', 0, 0, 50);
            let entity1 = createRectEntity('far1', 'GenericFar1', 200, 200, 10, 10, 1, 1);
            let entity1Transform = entity1.getComponent('Transform');
            let entity1Movement = entity1.getComponent('Movement');
            world.addEntity(boundary);
            world.addEntity(entity1);
            collisionSystem.update(world, 0.1);
            expect(entity1Transform.position.x).toBe(200);
            expect(entity1Transform.position.y).toBe(200);
            expect(entity1Movement.velocityX).toBe(1);
            expect(entity1Movement.velocityY).toBe(1);
        });
    });

    describe('Realistic Reflection Physics - Rect vs Immovable Rect', () => {
        const dt = 0.1;
        test('Direct Horizontal Hit', () => {
            const collisionSystem = setupSystem();
            let worldDirect = new MockWorld();
            let movingRectDirect = createRectEntity('moverD', 'MoverDirect', 8, 5, 10, 10, 10, 0);
            let wallDirect = createRectEntity('wallD', 'WallDirect', 10, 5, 2, 20);
            worldDirect.addEntity(movingRectDirect);
            worldDirect.addEntity(wallDirect);
            collisionSystem.update(worldDirect, dt);
            const moverDTransform = movingRectDirect.getComponent('Transform');
            const moverDMovement = movingRectDirect.getComponent('Movement');
            expect(moverDMovement.velocityX).toBeCloseTo(-10);
            expect(moverDMovement.velocityY).toBe(0);
            expect(moverDTransform.position.x).toBeCloseTo(3.99);
            expect(wallDirect.getComponent('Transform').position.x).toBe(10);
        });
        test('Angled Hit on Horizontal Wall Face', () => {
            const collisionSystem = setupSystem();
            let worldAngled = new MockWorld();
            let movingRectAngled = createRectEntity('moverA', 'MoverAngled', 5, 8, 10, 10, 10, -10);
            let wallAngled = createRectEntity('wallA', 'WallAngled', 5, 10, 20, 2);
            worldAngled.addEntity(movingRectAngled);
            worldAngled.addEntity(wallAngled);
            collisionSystem.update(worldAngled, dt);
            const moverATransform = movingRectAngled.getComponent('Transform');
            const moverAMovement = movingRectAngled.getComponent('Movement');
            expect(moverAMovement.velocityX).toBeCloseTo(10);
            expect(moverAMovement.velocityY).toBeCloseTo(10);
            expect(moverATransform.position.x).toBeCloseTo(5);
            expect(moverATransform.position.y).toBeCloseTo(3.99);
        });
    });

    describe('Realistic Reflection Physics - Circle vs Immovable Rect', () => {
        const dt = 0.1;
        test('Direct Horizontal Hit (EXPECTED TO FAIL UNTIL BUGFIX)', () => {
            const collisionSystem = setupSystem();
            let worldDirect = new MockWorld();
            let movingCircleDirect = createCircleEntity('cMoverD', 'CircleMoverDirect', 8, 0, 5, 10, 0);
            let wallDirectC = createRectEntity('cWallD', 'CircleWallDirect', 10, 0, 2, 20);
            worldDirect.addEntity(movingCircleDirect);
            worldDirect.addEntity(wallDirectC);
            collisionSystem.update(worldDirect, dt);
            const cMoverDTransform = movingCircleDirect.getComponent('Transform');
            const cMoverDMovement = movingCircleDirect.getComponent('Movement');
            expect(cMoverDMovement.velocityX).toBeCloseTo(-10);
            expect(cMoverDMovement.velocityY).toBe(0);
            expect(cMoverDTransform.position.x).toBeCloseTo(3.99);
        });
        test('Angled Hit on Horizontal Wall Face', () => {
            const collisionSystem = setupSystem();
            let worldAngled = new MockWorld();
            let movingCircleAngled = createCircleEntity('cMoverA', 'CircleMoverAngled', 0, 8, 5, 0, -10);
            let wallAngledC = createRectEntity('cWallA', 'CircleWallAngled', 0, 10, 20, 2);
            worldAngled.addEntity(movingCircleAngled);
            worldAngled.addEntity(wallAngledC);
            collisionSystem.update(worldAngled, dt);
            const cMoverATransform = movingCircleAngled.getComponent('Transform');
            const cMoverAMovement = movingCircleAngled.getComponent('Movement');
            expect(cMoverAMovement.velocityX).toBeCloseTo(0);
            expect(cMoverAMovement.velocityY).toBeCloseTo(10);
            expect(cMoverATransform.position.y).toBeCloseTo(3.99);
        });
    });
    
    describe('Realistic Reflection Physics - Two Moving Rects', () => {
        const dt = 0.01;
        test('Head-on Collision', () => {
            const collisionSystem = setupSystem();
            let worldHeadOn = new MockWorld();
            let rectA_headOn = createRectEntity('rectA_HO', 'RectA_HeadOn', 8, 0, 10, 10, 10, 0);
            let rectB_headOn = createRectEntity('rectB_HO', 'RectB_HeadOn', 10, 0, 10, 10, -10, 0);
            const movA_HO = rectA_headOn.getComponent('Movement');
            const movB_HO = rectB_headOn.getComponent('Movement');
            const trA_HO = rectA_headOn.getComponent('Transform');
            const trB_HO = rectB_headOn.getComponent('Transform');
            const initialMomentumX_HO = movA_HO.velocityX + movB_HO.velocityX;
            worldHeadOn.addEntity(rectA_headOn);
            worldHeadOn.addEntity(rectB_headOn);
            collisionSystem.update(worldHeadOn, dt);
            expect(movA_HO.velocityX).toBeCloseTo(-10);
            expect(movB_HO.velocityX).toBeCloseTo(10);
            expect(movA_HO.velocityX + movB_HO.velocityX).toBeCloseTo(initialMomentumX_HO);
            expect(trA_HO.position.x).toBeCloseTo(3.99);
            expect(trB_HO.position.x).toBeCloseTo(14.01);
        });
        test('Angled Collision with horizontal normal', () => {
            const collisionSystem = setupSystem();
            let worldAngled = new MockWorld();
            let rectA_Angled = createRectEntity('rectA_Ang', 'RectA_Angled', 8, 0, 10, 10, 10, 0);
            let rectB_Angled = createRectEntity('rectB_Ang', 'RectB_Angled', 10, 1, 10, 10, -10, 0);
            const movA_Ang = rectA_Angled.getComponent('Movement');
            const movB_Ang = rectB_Angled.getComponent('Movement');
            const trA_Ang = rectA_Angled.getComponent('Transform');
            const trB_Ang = rectB_Angled.getComponent('Transform');
            const initialMomentumX_Ang = movA_Ang.velocityX + movB_Ang.velocityX;
            const initialMomentumY_Ang = movA_Ang.velocityY + movB_Ang.velocityY;
            worldAngled.addEntity(rectA_Angled);
            worldAngled.addEntity(rectB_Angled);
            collisionSystem.update(worldAngled, dt);
            expect(movA_Ang.velocityX).toBeCloseTo(-10);
            expect(movA_Ang.velocityY).toBe(0);
            expect(movB_Ang.velocityX).toBeCloseTo(10);
            expect(movB_Ang.velocityY).toBe(0);
            expect(movA_Ang.velocityX + movB_Ang.velocityX).toBeCloseTo(initialMomentumX_Ang);
            expect(movA_Ang.velocityY + movB_Ang.velocityY).toBeCloseTo(initialMomentumY_Ang);
            expect(trA_Ang.position.x).toBeCloseTo(3.99);
            expect(trB_Ang.position.x).toBeCloseTo(14.01);
            expect(trA_Ang.position.y).toBeCloseTo(0);
            expect(trB_Ang.position.y).toBeCloseTo(1);
        });
        test('Collision with vertical normal', () => {
            const collisionSystem = setupSystem();
            let worldVertical = new MockWorld();
            let rectA_Vert = createRectEntity('rectA_V', 'RectA_Vertical', 0, 8, 10, 10, 0, -10);
            let rectB_Vert = createRectEntity('rectB_V', 'RectB_Vertical', 0, 10, 10, 10, 0, 10);
            const movA_Vert = rectA_Vert.getComponent('Movement');
            const movB_Vert = rectB_Vert.getComponent('Movement');
            const initialMomentumY_Vert = movA_Vert.velocityY + movB_Vert.velocityY;
            worldVertical.addEntity(rectA_Vert);
            worldVertical.addEntity(rectB_Vert);
            collisionSystem.update(worldVertical, dt);
            expect(movA_Vert.velocityY).toBeCloseTo(10);
            expect(movB_Vert.velocityY).toBeCloseTo(-10);
            expect(movA_Vert.velocityX).toBe(0);
            expect(movB_Vert.velocityX).toBe(0);
            expect(movA_Vert.velocityY + movB_Vert.velocityY).toBeCloseTo(initialMomentumY_Vert);
        });
    });

    describe('Realistic Reflection Physics - Moving Circle vs Moving Rect', () => {
        test('Vertical collision with velocity exchange', () => {
            const collisionSystem = setupSystem();
            const dt = 0.01;
            let circleA = createCircleEntity('circleA', 'MCircleA', 0, 8, 5, 0, -10);
            let rectB = createRectEntity('rectB', 'MRectB', 0, 10, 10, 2, 0, 10);
            const trA = circleA.getComponent('Transform');
            const trB = rectB.getComponent('Transform');
            const movA = circleA.getComponent('Movement');
            const movB = rectB.getComponent('Movement');
            const initialMomentumY = movA.velocityY + movB.velocityY;
            let worldCircleRect = new MockWorld();
            worldCircleRect.addEntity(circleA);
            worldCircleRect.addEntity(rectB);
            collisionSystem.update(worldCircleRect, dt);
            expect(movA.velocityY).toBeCloseTo(10);
            expect(movB.velocityY).toBeCloseTo(-10);
            expect(movA.velocityX).toBe(0);
            expect(movB.velocityX).toBe(0);
            expect(movA.velocityY + movB.velocityY).toBeCloseTo(initialMomentumY);
            expect(trA.position.y).toBeCloseTo(5.99);
            expect(trB.position.y).toBeCloseTo(12.01);
        });
    });
});
