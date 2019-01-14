import {
  TILE_SIZE, GROUND_FRICTION, AIR_FRICTION,
  TOP, BOTTOM, LEFT, RIGHT
} from './constants.js'

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

const getPointForSide = (side, sprite)=> {
  if (side === LEFT) {
    return {x: sprite.position.x, y: sprite.position.y + TILE_SIZE / 2}
  }
  if (side === RIGHT) {
    return {x: sprite.position.x + TILE_SIZE, y: sprite.position.y + TILE_SIZE / 2}
  }
  if (side === TOP) {
    return {x: sprite.position.x + TILE_SIZE / 2, y: sprite.position.y}
  }
  if (side === BOTTOM) {
    return {x: sprite.position.x + TILE_SIZE / 2, y: sprite.position.y + TILE_SIZE}
  }
}

const isOverlappingSide = (side, spriteA, spriteB)=> {
  const point = getPointForSide(side, spriteA);
  const {x, y} = point;
  const {top, bottom, left, right} = getEdges(spriteB);
  
  return (
    y > top &&
    y < bottom &&
    x > left &&
    x < right
  );
};


const getCollidedEdges = (spriteA, spriteB)=> {
  const prevEdgesA = getEdges({position: {...spriteA.prevPosition}});
  const edgesB = getEdges(spriteB);
  const collidedEdges = {top: false, bottom: false, left: false, right: false};

  // by checking if an edge was not overlapping last frame but is this frame
  // we can see which edge is colliding
  if (prevEdgesA.top > edgesB.bottom) {
    collidedEdges[TOP] = true;
  }
  else if (prevEdgesA.bottom <= edgesB.top) {
    collidedEdges[BOTTOM] = true;
  }

  if (prevEdgesA.left > edgesB.right) {
    collidedEdges[LEFT] = true;
  }
  else if (prevEdgesA.right <= edgesB.left) {
    collidedEdges[RIGHT] = true;
  }

  return collidedEdges;
}

const getAxisFromEdge = (edge)=> {
  const edgeAxisMap = {
    LEFT: 'x',
    RIGHT: 'x',
    TOP: 'y',
    BOTTOM: 'y'
  };

  return edgeAxisMap[edge];
}

// newSprite.touching.bottom = true;
// newSprite.position.y = edgesB[TOP] - TILE_SIZE;
// newSprite.velocity.y = 0;

const getCollideState = (edgeA, spriteA, spriteB)=> {
  const edgesB = getEdges(spriteB);
  const touching = {...spriteA.touching, [edgeA]: true};
  const velocity = {...spriteA.velocity, [getAxisFromEdge(edgeA)]: 0};

  let position = {...spriteA.position};
  if (edgeA === TOP) {
    position.y = edgesB[BOTTOM];
  }
  else if (edgeA === BOTTOM) {
    position.y = edgesB[TOP] - TILE_SIZE;
  }
  else if (edgeA === LEFT) {
    position.x = edgesB[RIGHT];
  }
  else if (edgeA === RIGHT) {
    position.x = edgesB[LEFT] - TILE_SIZE;
  }

  let colliding = {...spriteA.colliding};
  colliding[edgeA] = [...spriteA.colliding[edgeA], {name: spriteB.name}];

  return {touching, position, velocity, colliding};
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
      let newSprite = {...spriteA};
      
      if (collidedEdges[TOP]) {
        newSprite = {...newSprite, ...getCollideState(TOP, spriteA, spriteB)}
      }
      else if (collidedEdges[BOTTOM]) {
        newSprite = {...newSprite, ...getCollideState(BOTTOM, spriteA, spriteB)}
      }

      // Check if overlap has been resolved before resolving horizontal collisions
      // This is a cheap trick to prevent sprite from catching on the corners
      // of adjacent tiles (vertical is resolved first & the horizontal is avoided)
      if (isOverlapping(newSprite, spriteB)) {
        if (collidedEdges[LEFT]) {
          newSprite = {...newSprite, ...getCollideState(LEFT, spriteA, spriteB)}
        }
        else if (collidedEdges[RIGHT]) {
          newSprite = {...newSprite, ...getCollideState(RIGHT, spriteA, spriteB)}
        }
      }
      
      return newSprite;
    }
  }

  return spriteA;
};

export const applySpriteCollisionsCrossMethod = (spriteA, sprites)=> {
  if (spriteA.static) {
    return spriteA;
  }

  for (const spriteB of sprites) {
    if (spriteA.id === spriteB.id) {
      continue;
    }

    let newSprite = {...spriteA};
    let didOverlap = false;

    if (isOverlappingSide(LEFT, spriteA, spriteB)) {
      newSprite = {...newSprite, ...getCollideState(LEFT, spriteA, spriteB)};
      didOverlap = true;
    }
    else if (isOverlappingSide(RIGHT, spriteA, spriteB)) {
      newSprite = {...newSprite, ...getCollideState(RIGHT, spriteA, spriteB)};
      didOverlap = true;
    }

    if (isOverlappingSide(TOP, spriteA, spriteB)) {
      newSprite = {...newSprite, ...getCollideState(TOP, spriteA, spriteB)};
      didOverlap = true;
    }
    else if (isOverlappingSide(BOTTOM, spriteA, spriteB)) {
      newSprite = {...newSprite, ...getCollideState(BOTTOM, spriteA, spriteB)};
      didOverlap = true;
    }

    if (didOverlap) {
      return newSprite;
    }
  }

  return spriteA
};

export const applyWallCollisions = (sprite, width, height)=> {
  if (sprite.static) {
    return sprite;
  }

  const newPosition = {...sprite.position};
  const newTouching = {...sprite.touching};

  if (sprite.position.y > height - TILE_SIZE) {
    newPosition.y = height - TILE_SIZE;
    newTouching.bottom = true;
  }

  if (sprite.position.y < 0) {
    newPosition.y = 0;
    newTouching.top = true;
  }

  if (sprite.position.x > width - TILE_SIZE) {
    newPosition.x = width - TILE_SIZE;
    newTouching.right = true;
  }

  if (sprite.position.x < 0) {
    newPosition.x = 0;
    newTouching.left = true;
  }
  
  return {
    ...sprite,
    position: newPosition,
    touching: newTouching
  }
};

export const storePreviousPosition = (sprite)=> ({
  ...sprite,
  prevPosition: {...sprite.position}
});

export const applyAcceleration = (sprite)=> {
  const {velocity, maxVelocity, acceleration} = sprite;
  return {
    ...sprite,
    velocity: {
      x: Math.max(Math.min(velocity.x + acceleration.x, maxVelocity.x), -maxVelocity.x),
      y: Math.max(Math.min(velocity.y + acceleration.y, maxVelocity.y), -maxVelocity.y)
    },
    acceleration: {x: 0, y: 0}
  }
};

export const applyVelocity = (sprite)=> ({
  ...sprite,
  position: {
    x: sprite.position.x + sprite.velocity.x,
    y: sprite.position.y + sprite.velocity.y
  }
});

export const resetTouching = (sprite)=> ({
  ...sprite,
  touching: {top: false, bottom: false, left: false, right: false},
  colliding: {top: [], bottom: [], left: [], right: []}
});

export const applyFriction = (sprite)=> ({
  ...sprite,
  velocity: {
    x: (sprite.touching.top || sprite.touching.bottom)
      ? sprite.velocity.x * GROUND_FRICTION
      : sprite.velocity.x * AIR_FRICTION,
    y: (sprite.touching.left || sprite.touching.right)
      ? sprite.velocity.y * GROUND_FRICTION
      : sprite.velocity.y * AIR_FRICTION,
  }
});