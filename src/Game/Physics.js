import {TILE_SIZE, FRICTION, TOP, BOTTOM, LEFT, RIGHT} from './constants.js'

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

const getCollidedEdges = (spriteA, spriteB)=> {
  const prevEdgesA = getEdges({position: {...spriteA.prevPosition}});
  const edgesB = getEdges(spriteB);
  const collidedEdges = {top: false, bottom: false, left: false, right: false};

  // by checking if an edge was not overlapping last frame but is this frame
  // we can see which edge is colliding
  if (prevEdgesA.top >= edgesB.bottom) {
    collidedEdges[TOP] = true;
  }
  else if (prevEdgesA.bottom <= edgesB.top) {
    collidedEdges[BOTTOM] = true;
  }

  if (prevEdgesA.right <= edgesB.left) {
    collidedEdges[RIGHT] = true;
  }
  else if (prevEdgesA.left >= edgesB.right) {
    collidedEdges[LEFT] = true;
  }

  return collidedEdges;
}

export const applySpriteCollisions = (spriteA, sprites)=> {
  if (spriteA.static) {
    return spriteA;
  }

  for (const spriteB of sprites) {
    if (spriteA.id === spriteB.id) {
      continue;
    }

    if (isOverlapping(spriteA, spriteB)) {
      const collidedEdges = getCollidedEdges(spriteA, spriteB);
      const newPosition = {...spriteA.position};
      const newVelocity = {...spriteA.velocity};
      const edgesB = getEdges(spriteB);
      
      if (collidedEdges[TOP]) {
        newPosition.y = edgesB[BOTTOM];
        newVelocity.y = 0;
      }
      else if (collidedEdges[BOTTOM]) {
        newPosition.y = edgesB[TOP] - TILE_SIZE;
        newVelocity.y = 0;
      }

      // Check if overlap has been resolved before resolving horizontal collisions
      // This is a cheap trick to prevent sprite from catching on the corners
      // of adjacent tiles (vertical is resolved first & the horizontal is avoided)
      if (isOverlapping({...spriteA, position: newPosition}, spriteB)) {
        if (collidedEdges[LEFT]) {
          newPosition.x = edgesB[RIGHT];
          newVelocity.x = 0;
        }
        else if (collidedEdges[RIGHT]) {
          newPosition.x = edgesB[LEFT];
          newVelocity.x = 0;
        }
      }
      
      return {
        ...spriteA,
        position: newPosition,
        velocity: newVelocity,
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

export const storePreviousPosition = (sprite)=> ({
  ...sprite,
  prevPosition: {...sprite.position}
});

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