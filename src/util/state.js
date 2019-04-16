import uniqid from 'uniqid';
import {matches, mergeWith, merge} from 'lodash';
import {MAX_VELOCITY, TILE_SIZE} from '../Game/constants.js';

export const createNewSprite = (name, x, y)=> ({
  name: name,
  position: {x, y},
  prevPosition: {x, y},
  velocity: {x: 0, y: 0},
  maxVelocity: {x: MAX_VELOCITY, y: MAX_VELOCITY},
  acceleration: {x: 0, y: 0},
  friction: 0.15,
  colliding: {
    top: [],
    bottom: [],
    left: [],
    right: []
  },
  static: false,
  inputs: {}
});

// also removes a single space on the outside of the bracket (if one exists)
// otherwise it's possible to end up with multiple spaces where brackets stack
// eg: '{ velocity: { y: -150 } }'   *could become*   ' velocity: { y: -150  }'
export const trimBrackets = (rawString)=> {
  const string = rawString.trim()
    if (!isObject(string)) {
      return rawString
    }
    const openIndex = string.indexOf('{');
    const closeIndex = string.lastIndexOf('}');
    
    return string.substr(openIndex + 1, closeIndex - 1).trim();
}

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
  STATIC: {static: true},
  STATIONARY: {velocity: {x: 0, y: 0}}
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
  // getCollidingForSide('bottom', 'forward' ... refers to searching for the
  // colliding state for the bottom side by traversing the ruleString to the
  // right (forward)
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
  const [left, right] = ruleString.replace(firstWord, '').split('->');

  // <------- leftWordArrays ----->    <--- rightWordArrays -->
  // <---words--> < ----words----->    <-words-> <---words---->
  // [ UP Player | Goomba | Brick ] -> [ Player | DEAD Goomba ]

  const leftWordGroupArrays = trimBrackets(left).split('|')
    .map((string)=> stringToWordGroups(string))

  const rightWordGroupArrays = trimBrackets(right)
    .split('|')
    .map((string)=> stringToWordGroups(string))

  let leftStates = [];
  let rightStates = [];

  // Left
  // The left side is what the rule is looking to match.
  // The colliding state should recursively nest colliding states if the rule
  // has multiple collisions
  for (const words of leftWordGroupArrays) {
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
  for (const words of rightWordGroupArrays) {
    const matchingLeft = leftWordGroupArrays[rightIndex]
    let state = {};
    if (matchingLeft) {
      // If there's a matching left state, then this state is a transition of that
      // state. It may be a small change like adding DEAD to a Player.
      // Eg: [ Mario | Goomba ] -> [ DEAD Mario | Goomba ]
      
      // Flatten and merge all the states together into a single state object
      const states = words.map((string)=> stringToState(string, names))
      for (const subState of states) {
        merge(state, subState);
      }
    }
    else {
      // If there is no matching let state, then this is a completely new state.
      // Eg: the fireball in this rule: [ <ACTION> Mario ] -> [ Mario | Fireball ]
      const newSprite = createNewSprite('TEMP_NAME', 0, 0);
      state = {
        ...newSprite,
        // indicates to applyRules not to merge this but create new state
        createNew: {direction},
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

      // Number
      const number = Number(right.trim())
      if (typeof number === 'number' && !isNaN(number)) {
        return {[left]: number}
      }

      // Object
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

const propertyRegex = /^\b[a-z_]+\b\s{0,1}[:]/i // property can't have space before colon
// word can still match on ':', so must come after property
const wordRegex = /^[<]{0,1}[a-z_]+[0-9a-z_]*[>]{0,1}/i
const objectRegex = /^\{/i // simply checks if string starts with '{'
const numberRegex = /^[-]{0,1}[0-9]*[.]{0,1}[0-9]+/

const isWord = (string)=> Boolean(string.match(wordRegex))
const isProperty = (string)=> Boolean(string.match(propertyRegex))
const isObject = (string)=> Boolean(string.match(objectRegex))
const isNumberString = (string)=> Boolean(string.match(numberRegex))

const splitOnProperty = (string)=> {
  const [property] = string.match(propertyRegex)
  const name = property.trim().replace(':', '')
  const right = string.replace(property, '').trim()
  
  let numOpenBrackets = 0
  for (var i = 0; i < right.length; i++) {
    const char = right.charAt(i)

    if (numOpenBrackets < 0) {
      console.error('more closing brackets than opening brackets')
    }

    if (char === '{') {
      numOpenBrackets++
    }
    else if (char === '}') {
      numOpenBrackets--
    }
    else if (char === ' ' && numOpenBrackets === 0) {
      const value = right.slice(0, i + 1).trim()
      const remainder = right.slice(i + 1).trim()
      
      return [
        `${name}: ${value}`,
        remainder
      ]
    }
  }

  if (numOpenBrackets !== 0) {
    console.error('unclosed brackets')
  }
  
  // Made it to the end:
  // value is entire string, no remainder
  return  [`${name}: ${right}`, '']
}

const splitOnObject = (string)=> {
  let numOpenBrackets = 0
  for (var i = 0; i < string.length; i++) {
    const char = string.charAt(i)

    if (numOpenBrackets < 0) {
      console.error('more closing brackets than opening brackets')
    }

    if (char === '{') {
      numOpenBrackets++
    }
    else if (char === '}') {
      numOpenBrackets--
    }
    else if (char === ' ' && numOpenBrackets === 0) {
      const objectString = string.slice(0, i + 1).trim()
      const remainder = string.slice(i + 1).trim()

      return [
        objectString,
        remainder
      ]
    }
  }

  if (numOpenBrackets !== 0) {
    console.error('unclosed brackets')
  }
  
  // Made it to the end:
  // value is entire string, no remainder
  return  [string, '']
}

const splitOnFirstWordGroup = (rawString)=> {
  const string = rawString.trim()

  if (isObject(string)) {
    return splitOnObject(string)
  }

  if (isProperty(string)) {
    return splitOnProperty(string)
  }

  if (isWord(string)) {
    const [word] = string.match(wordRegex)

    return [word.trim(), string.replace(word, '')]
  }

  if (isNumberString(string)) {
    const [numberString] = string.match(numberRegex)

    return [numberString, string.replace(numberString, '')]
  }

  console.error('made it to the end without returning anything:', string)
}

const stringToWordGroups = (string)=> {  
  const [left, rest] = splitOnFirstWordGroup(string)

  if (rest.length === 0) {
    return [left]
  }

  return [left, ...stringToWordGroups(rest)]
}

const propertyToState = (property, names)=> {
  const firstColonRegex = /:(.+)/ 
  // the (.+) in the regex is to ensure the rest of the string is included in the 2nd arg
  // without it, the string will split on every colon, not just the first
  const [name, right] = property.split(firstColonRegex)
  
  if (isObject(right.trim())) {
    const trimmed = trimBrackets(right.trim())
    const innerState = stringToState(trimmed, names)
    
    return {
      [name]: {...innerState},
    }
  }
  else {
    const valueState = stringToState(right.trim(), names)

    return {
      [name]: valueState,
    }
  }
}

// input: '{ Player carrying: Brick }'
// output: { name: 'Player', carrying: {name: 'Brick'} }
const stringToState = (string, names)=> {
  const wordGroups = stringToWordGroups(string)

  if (wordGroups.length === 0) {
    console.error('No word groups')
  }
  else if (wordGroups.length === 1) {
    const [group] = wordGroups

    // Property
    if (isProperty(group)) {
      return propertyToState(group, names)
    }

    // Expandable keyword
    if (isWord(group)) {
      return wordsToState([group], names)
    }

    if (isNumberString(group)) {
      return parseFloat(group)
    }

    console.error('not dealing with:', wordGroups)
    return {}
  }

  let states = []
  for (const group of wordGroups) {
    states.push(stringToState(group, names))
  }

  // Flatten and merge all the states together into a single state object
  let resultState = {};
  for (const state of states) {
    merge(resultState, state);
  }

  return resultState
}

// { Player } -> { Player carrying: Brick }
export const ruleStringToState = (ruleString, names)=> {
  const [left, right] = ruleString.split('->')

  return [
    stringToState(trimBrackets(left), names),
    stringToState(trimBrackets(right), names)
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
// const mergeCustomizer = (objValue, srcValue)=> {
//   if (isNumber(objValue)) {
//     return objValue + srcValue;
//   }
// }

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
        result = mergeWith(sprite, state)
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