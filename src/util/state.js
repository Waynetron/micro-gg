import uniqid from 'uniqid';
import {matches, mergeWith, merge, isNumber} from 'lodash-es';
import {MAX_VELOCITY} from '../Game/constants.js';

export const createNewSprite = (name, x, y)=> ({
  name: name,
  position: {x, y},
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
const trimBrackets = (string)=> string.replace('[', '').replace(']', '')
const separateWords = (leftAndRightString)=> (
  leftAndRightString.map((string)=>
    trimBrackets(string).trim().split(' ')
  )
);
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

const isHorizontal = (direction)=>
  direction === 'left' || direction === 'right';

// Should return something like
// {
//    up: [],
//    down: [],
//    left: [],
//    right: []
// }

const collisionDirectionToParseDirections = {
  right: 'forward',
  left: 'backward',
  up: 'forward',
  down: 'backward'
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
Evaluate both rules into a pair of state mutations
[
  {name: "Player", acceleration: {x: 1, y: 0}},
  {name: "Player", dead: true}
]
[
  {name: "Spike"},
  {name: "Spike"}
]
// Finally adds a colliding property to the left side each state mutation
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
export const collisionRuleToStateMutations = (ruleString, names)=> {
  // Get collision direction (first word at the start of the line)
  const [firstWord] = ruleString.match(/^([A-Z]+)\b/);
  const direction = firstWord.toLowerCase();

  // Get the left and right matches
  const [left, right] = ruleString.split('->');
  const [leftGroup] = left.match(/\[.+?\]/);
  const [rightGroup] = right.match(/\[.+?\]/);

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

  // <-------- leftWordArrays----->    <--- rightWordArrays -->
  // <---words--> < ----words----->    <-words-> <---words---->
  // [ UP Player | Goomba | Brick ] -> [ Player | DEAD Goomba ]
  const leftWordArrays = leftGroup.split('|') |> separateWords;
  const rightWordArrays = rightGroup.split('|') |> separateWords;

  let leftStates = [];
  let rightStates = [];

  // Left
  // The left side is what the rule is looking to match.
  // The colliding state should recursively nest colliding states if the rule has multiple collisions
  let leftIndex = 0;
  for (const words of leftWordArrays) {
    const state = {
      ...wordsToState(words, names)
    }

    leftStates.push(state);
    leftIndex += 1;
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
      // If there's a matching left state, then this state is a mutation of that
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
        createNew: true, // indicates to applyStateMutations not to merge this but create new state
        ...wordsToState(words, names)
        // I don't think the right side needs the colliding state calculated
      }

      // Duplicate the leftmost match state as the match for this new state
      leftStatesWithColliding.push({...leftStates[0]});
    }

    rightStates.push(state);
    rightIndex += 1;
  }

  // State pairs to state mutations
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

export const ruleToStateMutation = (ruleString, names)=> {
  // First, turn the rule string into an array of words
  // eg: the ruleString "[ Goomba ] -> [ RIGHT Goomba ]"
  // becomes: [["Goomba"], ["RIGHT", "Goomba"]]
  const [leftWords, rightWords] = ruleString.split('->')
    |> separateWords;
    
  const leftState = wordsToState(leftWords, names);
  const rightState = wordsToState(rightWords, names);

  return [leftState, rightState];
}

export const getNewStateToAdd = (sprites, mutations)=> {
  const newState = [];

  for (const sprite of sprites) {
    for (const mutation of mutations) {
      const [left, right] = mutation;

      if (matches(left)(sprite)) {
        // Add new sprite + give it a unique ID
        newState.push({
          id: uniqid(),
          ...right
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

export const applyStateMutations = (sprite, mutations)=> {
  if (mutations.length === 0) {
    return sprite;
  }
  
  let resultState = {...sprite};

  for (const mutation of mutations) {
    const [left, right] = mutation;

    if (matches(left)(sprite)) {
      resultState = mergeWith(resultState, right, mergeCustomizer)
    }
  }

  return resultState;
};

export const isAlive = (sprite)=> !sprite.dead;
export const isCreateNewState = (stateMutation)=> {
  const [left, right] = stateMutation;
  return right.createNew;
};