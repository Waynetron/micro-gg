import uniqid from 'uniqid';
import {matches, mergeWith, merge, isNumber} from 'lodash';
import {MAX_VELOCITY, TILE_SIZE} from '../Game/constants.js';

export const createNewSprite = (name, x, y)=> ({
  name: name,
  position: {x, y},
  prevPosition: {x, y},
  velocity: {x: 0, y: 0},
  maxVelocity: {x: MAX_VELOCITY, y: MAX_VELOCITY},
  acceleration: {x: 0, y: 0},
  colliding: {
    top: [],
    bottom: [],
    left: [],
    right: []
  },
  static: false,
  inputs: {}
});
const trimBrackets = (string)=> string.replace('{', '').replace('}', '')
const separateWords = (string)=> trimBrackets(string).trim().split(' ')

const states = {
  UP: {acceleration: {y: -1}},
  DOWN: {acceleration: {y: 1}},
  LEFT: {acceleration: {x: -1}},
  RIGHT: {acceleration: {x: 1}},
  FAST_UP: {acceleration: {y: -6}},
  FAST_DOWN: {acceleration: {y: 6}},
  FAST_LEFT: {acceleration: {x: -6}},
  FAST_RIGHT: {acceleration: {x: 6}},
  SLOW_UP: {acceleration: {y: -0.5}},
  SLOW_DOWN: {acceleration: {y: 0.5}},
  SLOW_LEFT: {acceleration: {x: -0.5}},
  SLOW_RIGHT: {acceleration: {x: 0.5}},
  JUMP: {velocity: {y: -150}},
  DEAD: {dead: true},
  STATIC: {static: true}
};

const inputs = {
  '<UP>': 'up',
  '<DOWN>': 'down',
  '<LEFT>': 'left',
  '<RIGHT>': 'right',
  '<ACTION>': 'action1',
  '<ACTION1>': 'action1',
  '<ACTION2>': 'action2'
};

const getOpposite = (direction)=> {
  const oppositeMappings = {
    'left': 'right',
    'right': 'left',
    'top': 'bottom',
    'bottom': 'top',
    'up': 'down',
    'down': 'up',
    'forward': 'backward'
  }

  return oppositeMappings[direction];
}

const directionToSide = (direction)=> {
  const mappings = {
    'left': 'left',
    'right': 'right',
    'down': 'bottom',
    'up': 'top'
  }

  return mappings[direction];
}

// Recursively finds the colliding state
const getCollidingForSide = (side, traverseDirection, states, currentIndex)=> {
  const nextIndex = traverseDirection === 'forward' ? currentIndex + 1 : currentIndex - 1;
  // outside range
  if (nextIndex < 0 || nextIndex === states.length) {
    return;
  }

  const collidesWith = states[nextIndex];
  if (!collidesWith) {
    console.error('Expecting there to always be a state here');
  }

  let state = [{
    ...collidesWith
  }];

  const nextColliding = getCollidingForSide(side, traverseDirection, states, nextIndex);
  if (nextColliding) {
    state.colliding = {
      [side]: nextColliding
    }  
  }

  return state;
}

const getColliding = (direction, leftStates, leftIndex)=> {
  // direction refers to the direction the collision rule is applied in.
  // getCollidingForSide('bottom', 'forward' ... refers to searching for the colliding state for
  // the bottom side by traversing the ruleString to the right (forward)
  let colliding = {};
  const frontSide = directionToSide(direction);
  const backSide = getOpposite(frontSide);
  const frontColliding = getCollidingForSide(frontSide, 'forward', leftStates, leftIndex);
  const backColliding = getCollidingForSide(backSide, 'backward', leftStates, leftIndex);

  if (backColliding) {
    colliding[backSide] = backColliding;
  }

  if (frontColliding) {
    colliding[frontSide] = frontColliding;
  }

  if (frontColliding || backColliding) {
    return colliding; 
  }
  else {
    return;
  }
}

/*
Starts withObject.keys( ).length > 0 ? colliding : undefined;
  [ UP Player | Spike ] -> [ DEAD Player | Spike ]
Breaks up into 2 rules
  [ UP Player] -> [ DEAD Player]
  [ Spike ] -> [ Spike ]
Evaluate both rules into a pair of state transitions
[
  {name: "Player", acceleration: {x: 1, y: 0}},
  {name: "Player", dead: true}
]
[
  {name: "Spike"},
  {name: "Spike"}
]
// Finally adds a colliding property to the left side each state transition
[
  {
    name: "Player", acceleration: {x: 1, y: 0},
    colliding: {
      top: {name:'Spike'}, bottom: {name:'Spike'},
      left: {name:'Spike'}, right: {name:'Spike'}
    }
  },
  {name: "Player", dead: true}
]
[
  {
    name: "Spike",
    colliding: {
      top: {name:'Player'}, bottom: {name:'Player'},
      left: {name:'Player'}, right: {name:'Player'}
    }
  }
  {name: "Spike"}
]
*/
export const collisionRuleStringToState = (ruleString, names)=> {
  // Get collision direction (first word at the start of the line)
  const [firstWord] = ruleString.match(/^([A-Z]+)\b/);
  const direction = firstWord.toLowerCase();

  // Get the left and right matches
  const [left, right] = ruleString.split('->');
  const [leftGroup] = left.match(/\{.+?\}/);
  const [rightGroup] = right.match(/\{.+?\}/);

  // leftWords and rightWords can each be arbirary lengths
  // Consider the left side could be a collision involving 3 parties but on the right side
  // we only care about the first of those parties.
  // [ Player | Goomba | Player2 ] -> [ | DEAD Goomba | ]

  // Also consider the left side may involve no collisions, but the right side might
  // as is the case of mario throwing a fireball
  // HORIZONTAL [ <ACTION> Mario] -> [ Mario | HORIZONTAL Fireball ]
  // HORIZONTAL [ <ACTION> Mario] -> [ Mario + HORIZONTAL Fireball ]
  
  // const min = Math.min(left.length, right.length);
  // const max = Math.max(left.length, right.length);

  // // Deal with the simple matches first
  // for (let i = 0; i < min; i++) {

  // }

  // // These are the extras, the ones that don't have a match on the opposite side
  // for (let i = min; i < max; i++) {
  //   // If they exist on the left, but not the right. Then it is assumed the sprite is to remain as it was
  //   if (left.length > right.length) {
  //     const oldWords = left[i];
  //   }
  //   // But if they exist on the right, but not the left. Then these are new sprites to be spawned.
  //   else {
  //     const newWords = right[i];
  //   }
  // }

  // <------- leftWordArrays ----->    <--- rightWordArrays -->
  // <---words--> < ----words----->    <-words-> <---words---->
  // [ UP Player | Goomba | Brick ] -> [ Player | DEAD Goomba ]
  const leftWordArrays = leftGroup.split('|').map((string)=> separateWords(string))
  const rightWordArrays = rightGroup.split('|').map((string)=> separateWords(string))

  let leftStates = [];
  let rightStates = [];

  // Left
  // The left side is what the rule is looking to match.
  // The colliding state should recursively nest colliding states if the rule has multiple collisions
  for (const words of leftWordArrays) {
    const state = {
      ...wordsToState(words, names)
    }

    leftStates.push(state);
  }

  const leftStatesWithColliding = leftStates.map((state, index)=> {
    const colliding = getColliding(direction, leftStates, index);

    if (colliding) {
      return {
        ...state,
        colliding: getColliding(direction, leftStates, index),
      }
    }
    else {
      return state;
    }
  });

  // Right
  // The right state is any changes to the left state. And includes the creation
  // of completely new state.
  let rightIndex = 0;
  for (const words of rightWordArrays) {
    const matchingLeft = leftWordArrays[rightIndex];
    let state;
    if (matchingLeft) {
      // If there's a matching left state, then this state is a transition of that
      // state. It may be a small change like adding DEAD to a Player.
      // Eg: [ Mario | Goomba ] -> [ DEAD Mario | Goomba ]
      state = wordsToState(words, names);
    }
    else {
      // If there is no matching let state, then this is a completely new state.
      // Eg: the fireball in this rule: [ <ACTION> Mario ] -> [ Mario | Fireball ]
      const newSprite = createNewSprite('TEMP_NAME', 0, 0);
      state = {
        ...newSprite,
        createNew: {direction}, // indicates to applyRules not to merge this but create new state
        ...wordsToState(words, names)
        // I don't think the right side needs the colliding state calculated
      }

      // Duplicate the leftmost match state as the match for this new state
      leftStatesWithColliding.push({...leftStates[0]});
    }

    rightStates.push(state);
    rightIndex += 1;
  }

  // State pairs to state transitions
  return leftStatesWithColliding.map((leftState, index)=> [leftState, rightStates[index]]);

  // const leftStateA = wordsToState(leftWordsA, names);
  // const leftStateB = leftWordsB
  //   ? wordsToState(leftWordsB, names)
  //   : newSprite()
    
  // const rightStateA = wordsToState(rightWordsA, names);

  // // User may omit rightWordsB. In which case populate it with leftWordsB
  // // Eg: [ <ACTION> Player | Ground ] -> [ JUMP Player ]
  // // Becomes: [ <ACTION> Player | Ground ] -> [ JUMP Player ]
  // const rightStateB = wordsToState(rightWordsB ? rightWordsB : leftWordsB, names);

  // // Pay close attention to the flipping of A and B for certain variables.
  // // collidingA is used as the colliding state for spriteB and vice-a-versa
  // let collidingA = {};
  // collidingA[getOpposite(directionToSide(direction))] = [{...leftStateA}]

  // let collidingB = {};
  // collidingB[directionToSide(direction)] = [{...leftStateB}]

  // const pairA = [
  //   {...leftStateA, colliding: collidingB},
  //   rightStateA
  // ];
  // const pairB = [
  //   {...leftStateB, colliding: {...collidingA}},
  //   rightStateB
  // ];

  // return [pairA, pairB];
}

const wordsToState = (words, names)=> {
  /* Turn those words into arrays of key value objects
    [
      [{name: "Goomba"}],
      [{name: "Goomba"}, {acceleration: {x: 1}}]},
      [{name: "Goomba"}, {acceleration: {y: 1}}]}
    ]
  */
  const statesArr = words.map((word)=> {
    if (names[word]) {
      return ({
        name: word
      });
    }
    if (inputs[word]) {
      return ({
        inputs: {[inputs[word]]: true}
      });
    }
    if (states[word]) {
      return ({
        ...states[word]
      })
    }

    if (word.includes(':')) {
      const [left, right] = word.split(':')
      const rightState = wordsToState([right.trim()], names)

      return {[left]: {...rightState}}
    }

    return {};
  });

  /* Flatten and merge all the states together into a single state object:
    {name: "Goomba", acceleration: {x: 1, y: 1}}
  */
  let resultState = {};
  for (const stateObj of statesArr) {
    merge(resultState, stateObj);
  }

  return resultState;
};

// export const trimPreceedingKeyword = (ruleString)=> {
//   const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
//   const [left] = ruleString.split('[')
//   const firstWord = left.trim()
  
//   if (directions.includes(firstWord)) {
//     return ruleString.replace(firstWord, '').trim()
//   }

//   return ruleString;
// }

const splitOnFirstWordGroup = (string)=> {
  const words = separateWords(string)

  let i = 0
  for (const word of words) {
    if (!word.includes(':')) {
      const split = [
        words.slice(0, i + 1).join(" "),
        words.slice(i + 1).join(" ")
      ]

      return split
    }

    i++
  }
}

// input: '{ Player carrying: Brick }'
// output: { name: 'Player', carrying: {name: 'Brick'} }
const stringToState = (string, names)=> {  
  const [left, rest] = splitOnFirstWordGroup(string)

  if (rest.length === 0) {
    return [wordsToState([left], names)]
  }

  return [wordsToState([left], names), ...stringToState(rest, names)]
}

const flattenArrToObj = (states)=> {
  let result = {}
  for (const state of states) {
    result = merge(state, result)
  }

  return result
}

// { Player } -> { Player carrying: Brick }
export const ruleStringToState = (ruleString, names)=> {
  const [left, right] = ruleString.split('->')

  return [
    stringToState(left, names) |> flattenArrToObj,
    stringToState(right, names) |> flattenArrToObj
  ]
}

const addVectors = (vectorA, vectorB)=> ({
  x: vectorA.x + vectorB.x,
  y: vectorA.y + vectorB.y
});

const getDirectionOffset = (direction)=> {
  const directionOffsetsMap = {
    up: {x: 0, y: -TILE_SIZE},
    down: {x: 0, y: TILE_SIZE},
    left: {x: -TILE_SIZE, y: 0},
    right: {x: TILE_SIZE, y: 0}
  }

  return directionOffsetsMap[direction];
}

export const getNewStateToAdd = (sprites, transitions)=> {
  const newState = [];

  for (const sprite of sprites) {
    for (const transition of transitions) {
      const [left, right] = transition;

      if (matches(left)(sprite)) {
        // Add new sprite + give it a unique ID
        newState.push({
          ...right,
          id: uniqid(),
          position: addVectors(sprite.position, getDirectionOffset(right.createNew.direction)),
          createNew: undefined
        });
      }
    }
  }

  return newState;
}

export const addNewState = (sprites, newState)=> {
  return [
    ...sprites,
    ...newState
  ]
}

// custom merge rules
const mergeCustomizer = (objValue, srcValue)=> {
  if (isNumber(objValue)) {
    return objValue + srcValue;
  }
}

export const getStateChanges = (sprites, transitions)=> {
  if (transitions.length === 0) {
    return {};
  }

  const stateChanges = sprites.map((sprite)=> {
    let resultState = {...sprite};

    for (const transition of transitions) {
      const [left, right] = transition;

      if (matches(left)(sprite)) {
        resultState = mergeWith(resultState, right, mergeCustomizer)
      }
    }

    return resultState;
  })

  return stateChanges
};

export const getStateTransitions = (rules, sprites)=> {
  if (rules.length === 0) {
    return []
  }

  const transitions = {}
  for (const sprite of sprites) {
    for (const rule of rules) {
      const [left, right] = rule;
      if (matches(left)(sprite)) {
        if (!transitions[sprite.id]) {
          transitions[sprite.id] = []
        }
        
        transitions[sprite.id].push(right)
      }
    }
  }

  return transitions
};

export const applyStateTransitions = (transitions, sprites)=> {
  return sprites.map((sprite)=> {
    const newStates = transitions[sprite.id]
    if (newStates) {
      let result = {...sprite}
      for (const state of newStates) {
        result = mergeWith(sprite, state, mergeCustomizer)
      }

      return result
    }

    return sprite
  })
};

export const isAlive = (sprite)=> !sprite.dead;
export const isCreateNewState = (rule)=> {
  const [, right] = rule;
  return right.createNew !== undefined;
};