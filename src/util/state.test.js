import {applyStateTransitions, ruleStringToState, collisionRuleStringToState} from './state'

const names = {
  Player: true,
  Brick: true,
  Goomba: true
}

// describe('trim preceeding keywords', ()=> {
//   it('trims preceeding direction (& ignores others)', ()=> {
//     const rule = 'RIGHT { Player } -> { Player RIGHT }'

//     expect(trimPreceedingKeyword(rule)).toEqual(
//       '{ Player } -> { Player RIGHT }'
//     );
//   });

//   it('doesnt trim if no keyword', ()=> {
//     const rule = '{ Player } -> { Player DOWN }'

//     expect(trimPreceedingKeyword(rule)).toEqual(
//       '{ Player } -> { Player DOWN }'
//     );
//   });
// });

describe('converts rule string to state', ()=> {
  it('simple rule', ()=> {
    const rule = '{ Player } -> { Player DOWN }'

    expect(ruleStringToState(rule, names)).toEqual(
      [
        { name: 'Player' },
        { name: 'Player', acceleration: { y: 1 } }
      ]
    );
  });

  it('keyboard input and movement rule', ()=> {
    const rule = '{ <RIGHT> Player } -> { RIGHT Player }'

    expect(ruleStringToState(rule, names)).toEqual(
      [
        { inputs: { right: true }, name: 'Player' },
        { acceleration: { x: 1 }, name: 'Player' }
      ]
    );
  });

  it('adds custom friction state number', ()=> {
    const rule = '{ Player } -> { Player friction: 0.1 }'

    expect(ruleStringToState(rule, names)).toEqual(
      [
        { name: 'Player' },
        { name: 'Player', friction: 0.1 }
      ]
    );
  });
  
  it('adds custom carrying state object', ()=> {
    const rule = '{ Player } -> { Player carrying: Brick }'

    expect(ruleStringToState(rule, names)).toEqual(
      [
        { name: 'Player' },
        { name: 'Player', carrying: {name: 'Brick'} }
      ]
    );
  });

  it('matches on custom carrying state', ()=> {
    const rule = '{ Player carrying: Brick } -> { Player DEAD }'

    expect(ruleStringToState(rule, names)).toEqual(
      [
        { name: 'Player', carrying: {name: 'Brick'} },
        { name: 'Player', dead: true }
      ]
    );
  });
});

describe('converts collision rule string to state', ()=> {
  it('simple collision rule', ()=> {
    const rule = 'RIGHT { Player | Goomba } -> { DEAD Player | Brick }'

    expect(collisionRuleStringToState(rule, names)).toEqual(
      [
        [
          { name: 'Player', colliding: {right: [{name: 'Goomba'}]} },
          { name: 'Player', dead: true },
        ],
        [
          { name: 'Goomba', colliding: {left: [{name: 'Player'}]} },
          { name: 'Brick' },
        ]
      ]
    );
  });

  it('simple collision rule with custom state number', ()=> {
    const rule = 'RIGHT { Player | Goomba } -> { Player | Goomba money: 12 }'

    expect(collisionRuleStringToState(rule, names)).toEqual(
      [
        [
          { name: 'Player', colliding: {right: [{name: 'Goomba'}]} },
          { name: 'Player' },
        ],
        [
          { name: 'Goomba', colliding: {left: [{name: 'Player'}]} },
          { name: 'Goomba', money: 12 },
        ]
      ]
    );
  });

  it('simple collision rule with custom state', ()=> {
    const rule = 'RIGHT { Player | Goomba } -> { Player | Goomba carrying: Brick }'

    expect(collisionRuleStringToState(rule, names)).toEqual(
      [
        [
          { name: 'Player', colliding: {right: [{name: 'Goomba'}]} },
          { name: 'Player' },
        ],
        [
          { name: 'Goomba', colliding: {left: [{name: 'Player'}]} },
          { name: 'Goomba', carrying: {name: 'Brick'} },
        ]
      ]
    );
  });

  it('multiple collision rule', ()=> {
    const rule = 'RIGHT { Player | Goomba | Goomba } -> { Player | Goomba | Goomba }'

    const result = collisionRuleStringToState(rule, names)

    expect(JSON.stringify(result)).toEqual(
      JSON.stringify(
        [
          [
            { name: 'Player', colliding: {right: [{name: 'Goomba'}]} },
            { name: 'Player' },
          ],
          [
            { name: 'Goomba', colliding: {left: [{name: 'Player'}], right: [{name: 'Goomba'}]} },
            { name: 'Goomba' },
          ],
          [
            { name: 'Goomba', colliding: {left: [{name: 'Goomba'}]} },
            { name: 'Goomba' },
          ]
        ]
      )
    );
  });
});

describe('applying state transitions', ()=> {
  it('applies state transition', ()=> {
    const transitions = {spriteA: [{name: 'Woo'}]}
    const sprites = [{id: 'spriteA', name: 'Jeff'}]

    expect(applyStateTransitions(transitions, sprites)).toEqual(
      [{id: 'spriteA', name: 'Woo'}]
    );
  });
});
