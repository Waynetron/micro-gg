import {matches, mergeWith, isNumber} from 'lodash-es';

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
  JUMP: {
    velocity: {y: -250},
    inputs: {up: false}
  },
  DEAD: {dead: true},
  STATIC: {static: true}
};

const inputs = {
  '<UP>': 'up',
  '<DOWN>': 'down',
  '<LEFT>': 'left',
  '<RIGHT>': 'right',
  '<ACTION1>': 'action1',
  '<ACTION2>': 'action2'
};

const collisionFilterWords = {
  COLLIDE_TOP: true,
  COLLIDE_BOTTOM: true,
  COLLIDE_LEFT: true,
  COLLIDE_RIGHT: true
  // Note: if you add anything here, make sure to update getCollisionFilterWords
  // and make sure it doesn't accidentally use the new words
}

const collisionFilterWordsToSide = {
  COLLIDE_TOP: 'top',
  COLLIDE_BOTTOM: 'bottom',
  COLLIDE_LEFT: 'left',
  COLLIDE_RIGHT: 'right'
}

const getCollisionFilterWords = (words)=> {
  const filterWords = words.filter((word)=> collisionFilterWords[word]);
  
  // These are the words the sprite will collide against (eg: TOP, BOTTOM)
  if (filterWords.length > 0) {
    return filterWords;
  }

  // No filter words specified, return ANY
  // TODO: remove this code and put it into a desugaring step
  return ['COLLIDE_ANY'];
}

/*
Starts with 
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
export const collisionRuleToStateTransitions = (ruleString, names)=> {
  const [leftRule, rightRule] = ruleString.split('->');
  const [leftWordsA, leftWordsB] = leftRule.split('|') |> separateWords;
  const [rightWordsA, rightWordsB] = rightRule.split('|') |> separateWords;

  // Isolate the filter words from the left sides eg: TOP, BOTTOM
  const filterWordsA = getCollisionFilterWords(leftWordsA);
  const filterWordsB = getCollisionFilterWords(leftWordsB);

  const leftStateA = wordsToState(leftWordsA, names);
  const leftStateB = wordsToState(leftWordsB, names);
  const rightStateA = wordsToState(rightWordsA, names);
  const rightStateB = wordsToState(rightWordsB, names);

  // Pay close attention to the flipping of A and B for certain variables.
  // collidingA is used as the colliding state for spriteB and vice-a-versa
  let collidingA = {};
  for (const word of filterWordsB) {
    collidingA[collisionFilterWordsToSide[word]] = [{...leftStateA}]
  }

  let collidingB = {};
  for (const word of filterWordsA) {
    collidingB[collisionFilterWordsToSide[word]] = [{...leftStateB}]
  }

  const pairA = [
    {...leftStateA, colliding: collidingB},
    rightStateA
  ];
  const pairB = [
    {...leftStateB, colliding: {...collidingA}},
    rightStateB
  ];

  return [pairA, pairB];
}

const wordsToState = (words, names)=> {
  /* Turn those words into arrays of key value objects
    [
      [{name: "Goomba"}],
      [{name: "Goomba"}, {acceleration: {x: 1, y: 0}}]}
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

  /* Flatten it to a single array of objects
    [
      {name: "Goomba"},
      {name: "Goomba", acceleration: {x: 1, y: 0}}
    ]
  */
  return Object.assign({}, {}, ...statesArr);
};

export const ruleToStateTransition = (ruleString, names)=> {
  // First, turn the rule string into an array of words
  // eg: the ruleString "[ Goomba ] -> [ RIGHT Goomba ]"
  // becomes: [["Goomba"], ["RIGHT", "Goomba"]]
  const [leftWords, rightWords] = ruleString.split('->')
    |> separateWords;
    
  const leftState = wordsToState(leftWords, names);
  const rightState = wordsToState(rightWords, names);

  return [leftState, rightState];
}

// custom merge rules
const mergeCustomizer = (objValue, srcValue)=> {
  if (isNumber(objValue)) {
    return objValue + srcValue;
  }
}

export const applyStateTransition = (sprite, transitions)=> {
  let resultState = {...sprite};

  for (const transition of transitions) {
    const [left, right] = transition;

    if (matches(left)(sprite)) {
      resultState = mergeWith(resultState, right, mergeCustomizer)
    }
  }

  return resultState;
};

export const isAlive = (sprite)=> !sprite.dead;