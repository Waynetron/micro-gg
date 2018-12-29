import {
  parseRules, parseSprites, parseLegend,
  parseLevel, parseAssets, getLevelDimensions,
  ruleToState
} from '../Parse/util.js';
import {TILE_SIZE} from '../Game/constants.js'

const defaultState = {
  sprites: [],
  legend: [],
  rules: [],
  assets: [],
  width_in_tiles: 0,
  height_in_tiles: 0,
  elapsed: {
    sinceLastFrame: Date.now(),
    totalFrames: 0
  },
  frame: 0,
};

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

const applyAcceleration = (sprite)=> ({
  ...sprite,
  velocity: {
    x: sprite.velocity.x + sprite.acceleration.x,
    y: sprite.velocity.y + sprite.acceleration.y
  }
});

const applyVelocity = (sprite)=> ({
  ...sprite,
  position: {
    x: sprite.position.x + sprite.velocity.x,
    y: sprite.position.y + sprite.velocity.y
  }
});

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

const applySpriteCollisions = (spriteA, sprites)=> {
  if (spriteA.static) {
    return spriteA;
  }

  for (const spriteB of sprites) {
    if (spriteA.id !== spriteB.id && isOverlapping(spriteA, spriteB)) {
      return {
        ...spriteA,
        position: getNonCollidingPosition(spriteA, spriteB),
        velocity: {x: 0, y: 0}
      }
    }
  }

  return spriteA
};

const applyFloorCollision = (sprite)=> {
  if (sprite.static) {
    return sprite;
  }
  
  return {
  ...sprite,
  position: {
    ...sprite.position,
    y: sprite.position.y > 224 ? 224: sprite.position.y
  }
}};

const containsState = (state, sprite)=> {
  for (const entry of Object.entries(state)) {
    const [key, val] = entry;
    if (sprite[key] !== val) {
      return false;
    }
  }

  return true;
}

const applyRules = (sprites, rules)=> {
  for (const rule of rules) {
    const [matchState, newState] = ruleToState(rule);

    return sprites.map((sprite)=> {
      if (containsState(matchState, sprite)) {
        const newSprite = {...sprite, ...newState}
        return newSprite;
      }

      return sprite;
    });
  }
}

const gameReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'UPDATE_CODE':
      const {code} = action;
      const level = parseLevel(code);
      const legend = parseLegend(code);
      const assets = parseAssets(code);
      const sprites = parseSprites(level, legend, assets);
      const rules = parseRules(code);
      const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

      return {
        ...state,
        sprites,
        legend,
        rules,
        assets,
        width: width_in_tiles * TILE_SIZE,
        height: height_in_tiles * TILE_SIZE,
      }
    case 'UPDATE_ELAPSED':
      const {elapsed} = action;
      return {
          ...state,
          // Using object with a frame counter inside the object to make sure
          // it always rerenders when used in components
          // My thinking is that if I just use elapsed, then it's possible for the same elapsed value
          // to fire twice in a row, and the 2nd render might not be called (optimised away)
          elapsed: {
            sinceLastFrame: Date.now() - elapsed,
            totalFrames: state.elapsed.totalFrames + 1
          },
          sprites: applyRules(state.sprites, state.rules)
            .map((sprite)=> (
              sprite
                |> applyAcceleration
                |> applyVelocity
                |> (_ => applySpriteCollisions(_, state.sprites))
                |> applyFloorCollision
            )
          )
      }
    default:
      return state
  }
}

export default gameReducer