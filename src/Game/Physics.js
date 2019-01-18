import {
  TILE_SIZE, GROUND_FRICTION, AIR_FRICTION,
  TOP, BOTTOM, LEFT, RIGHT
} from './constants.js'

export const roundToPixels = (sprite)=> ({
  ...sprite,
  position: {
    x: Math.round(sprite.position.x),
    y: Math.round(sprite.position.y),
  }
});

const getEdges = (sprite)=> ({
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

const getPointsForSide = (side, sprite)=> {
  // INSET is to prevent situations such as both TOP and LEFT/RIGHT colliding when 2 sprites are standing
  // next to each other.
  // It's not ideal because it means you do things like stand on a sprite just on the very outmost edge
  // without triggering any UP DOWN collisions.
  const INSET = 5;

  if (side === LEFT) {
    return [
      {x: sprite.position.x, y: sprite.position.y + INSET},
      {x: sprite.position.x, y: sprite.position.y + TILE_SIZE - INSET}
    ]
  }
  if (side === RIGHT) {
    return [
      {x: sprite.position.x + TILE_SIZE, y: sprite.position.y + INSET},
      {x: sprite.position.x + TILE_SIZE, y: sprite.position.y + TILE_SIZE - INSET}
    ]
  }
  if (side === TOP) {
    return [
      {x: sprite.position.x + INSET, y: sprite.position.y},
      {x: sprite.position.x + TILE_SIZE - INSET, y: sprite.position.y}
    ]
  }
  if (side === BOTTOM) {
    return [
      {x: sprite.position.x + INSET, y: sprite.position.y + TILE_SIZE},
      {x: sprite.position.x + TILE_SIZE - INSET, y: sprite.position.y + TILE_SIZE}
    ]
  }
}

const isOverlappingPoint = (point, spriteA, spriteB)=> {
  const {x, y} = point;
  const {top, bottom, left, right} = getEdges(spriteB);

  // Added +/- 1 to have things collide when they are perfectly next to each other but not overlapping
  // This is a temporary fix for a bug that is causing non-moving sprites to not register collisions
  // In fact that bug is still present, and now, combined with this means that a spriteA will need to jump on a DOWN moving
  // spriteB twice to trigger the collision on spriteB's COLLIDE_TOP.
  return (
    y > top - 1 &&
    y < bottom + 1 &&
    x > left - 1 &&
    x < right + 1
  );
}

const isOverlappingSide = (side, spriteA, spriteB)=> {
  const points = getPointsForSide(side, spriteA);

  for (const point of points) {
    if (isOverlappingPoint(point, spriteA, spriteB)) {
      return true;
    }
  }

  return false;
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

  if (prevEdgesA.left >= edgesB.right) {
    collidedEdges[LEFT] = true;
  }
  else if (prevEdgesA.right <= edgesB.left) {
    collidedEdges[RIGHT] = true;
  }

  return collidedEdges;
}

const getAxisFromEdge = (edge)=> {
  const edgeAxisMap = {
    left: 'x',
    right: 'x',
    top: 'y',
    bottom: 'y'
  };

  return edgeAxisMap[edge];
}

const getSeparatedState = (edgeA, spriteA, spriteB)=> {
  const edgesB = getEdges(spriteB);
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

  return {position, velocity};
}

export const updateSpriteCollidingState = (spriteA, sprites)=> {
  if (spriteA.static) {
    return spriteA;
  }

  let colliding = {...spriteA.colliding};

  for (const spriteB of sprites) {
    if (spriteA.id === spriteB.id) {
      continue;
    }

    for (const edge of [TOP, BOTTOM, LEFT, RIGHT]) {
      if (isOverlappingSide(edge, spriteA, spriteB)) {
        colliding[edge].push({name: spriteB.name});
      }
    }
  }

  return {...spriteA, colliding};
};

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
      let newSpriteA = {...spriteA};
      
      if (collidedEdges[TOP]) {
        newSpriteA = {
          ...newSpriteA,
          ...getSeparatedState(TOP, spriteA, spriteB)
        }
      }
      else if (collidedEdges[BOTTOM]) {
        newSpriteA = {
          ...newSpriteA,
          ...getSeparatedState(BOTTOM, spriteA, spriteB)
        }
      }

      // Check if overlap has been resolved before resolving horizontal collisions
      // This is a cheap trick to prevent sprite from catching on the corners
      // of adjacent tiles (vertical is resolved first & the horizontal is avoided)
      if (isOverlapping(newSpriteA, spriteB)) {
        if (collidedEdges[LEFT]) {
          newSpriteA = {
            ...newSpriteA,
            ...getSeparatedState(LEFT, spriteA, spriteB)
          }
        }
        else if (collidedEdges[RIGHT]) {
          newSpriteA = {
            ...newSpriteA,
            ...getSeparatedState(RIGHT, spriteA, spriteB)
          }
        }
      }
      
      return newSpriteA;
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
      newSprite = {
        ...newSprite,
        ...getSeparatedState(LEFT, spriteA, spriteB)
      };
      didOverlap = true;
    }
    else if (isOverlappingSide(RIGHT, spriteA, spriteB)) {
      newSprite = {
        ...newSprite,
        ...getSeparatedState(RIGHT, spriteA, spriteB)
      };
      didOverlap = true;
    }

    if (isOverlappingSide(TOP, spriteA, spriteB)) {
      newSprite = {
        ...newSprite,
        ...getSeparatedState(TOP, spriteA, spriteB)
      };
      didOverlap = true;
    }
    else if (isOverlappingSide(BOTTOM, spriteA, spriteB)) {
      newSprite = {
        ...newSprite,
        ...getSeparatedState(BOTTOM, spriteA, spriteB)
      };
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

  if (sprite.position.y > height - TILE_SIZE) {
    newPosition.y = height - TILE_SIZE;
  }

  if (sprite.position.y < 0) {
    newPosition.y = 0;
  }

  if (sprite.position.x > width - TILE_SIZE) {
    newPosition.x = width - TILE_SIZE;
  }

  if (sprite.position.x < 0) {
    newPosition.x = 0;
  }
  
  return {
    ...sprite,
    position: newPosition
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

export const resetColliding = (sprite)=> ({
  ...sprite,
  colliding: {top: [], bottom: [], left: [], right: []},

});

export const applyFriction = (sprite)=> ({
  ...sprite,
  velocity: {
    x: (sprite.colliding.top.length > 0 || sprite.colliding.bottom.length > 0)
      ? sprite.velocity.x * GROUND_FRICTION
      : sprite.velocity.x * AIR_FRICTION,
    y: (sprite.colliding.left.length > 0 || sprite.colliding.right.length > 0)
      ? sprite.velocity.y * GROUND_FRICTION
      : sprite.velocity.y * AIR_FRICTION,
  }
});