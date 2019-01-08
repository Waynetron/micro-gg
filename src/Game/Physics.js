import {TILE_SIZE, FRICTION} from './constants.js'

const getEdges = (sprite) => ({
  top: sprite.position.y,
  bottom: sprite.position.y + TILE_SIZE,
  left: sprite.position.x,
  right: sprite.position.x + TILE_SIZE
});

const isOverlapping = (spriteA, spriteB)=> {
  const a = getEdges(spriteA);
  const b = getEdges(spriteB);
  
  return (
    a.bottom > b.top &&
    a.top < b.bottom &&
    a.right > b.left &&
    a.left < b.right
  );
};

const getCenter = (sprite)=> ({
  x: sprite.position.x + (TILE_SIZE / 2),
  y: sprite.position.y + (TILE_SIZE / 2)
});

const getNonCollidingPosition = (spriteA, spriteB)=> {
  const {x, y} = spriteA.position;
  const {top, bottom, left, right} = getEdges(spriteB);
  const {velocity} = spriteA;
  const resolveHorizontal = Math.abs(velocity.x) > Math.abs(velocity.y);

  return resolveHorizontal
    ? {
      x: velocity.x > 0 ? left - TILE_SIZE : right,
      y
    }
    : {
      x,
      y: velocity.y > 0 ? top - TILE_SIZE : bottom,
    }
};

export const applySpriteCollisions = (spriteA, sprites)=> {
  if (spriteA.static) {
    return spriteA;
  }

  for (const spriteB of sprites) {
    if (spriteA.id !== spriteB.id && isOverlapping(spriteA, spriteB)) {
      return {
        ...spriteA,
        position: getNonCollidingPosition(spriteA, spriteB),
        velocity: {x: 0, y: 0},
      }
    }
  }

  return spriteA
};

const clamp = (value, min, max)=> {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

export const applyWallCollisions = (sprite, width, height)=> {
  if (sprite.static) {
    return sprite;
  }
  
  return {
    ...sprite,
    position: {
      ...sprite.position,
      y: clamp(sprite.position.y, 0, height - TILE_SIZE),
      x: clamp(sprite.position.x, 0, width - TILE_SIZE)
    }
  }
};

export const applyAcceleration = (sprite)=> ({
  ...sprite,
  velocity: {
    x: sprite.velocity.x + sprite.acceleration.x,
    y: sprite.velocity.y + sprite.acceleration.y
  }
});

export const applyVelocity = (sprite)=> ({
  ...sprite,
  position: {
    x: sprite.position.x + sprite.velocity.x,
    y: sprite.position.y + sprite.velocity.y
  }
});

export const applyFriction = (sprite)=> ({
  ...sprite,
  velocity: {
    x: sprite.velocity.x * FRICTION,
    y: sprite.velocity.y * FRICTION
  }
});