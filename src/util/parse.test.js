import {expandRules, standardExpansions, addImplicitKeywords,
  parseObjects, parseLists} from './parse'

describe('expanding regular rules', ()=> {
  it('doesnt expand (regular rules should not contain ALL)', ()=> {
    const rule = '{ Player } -> { DOWN Player }'

    expect(expandRules([rule], standardExpansions)).toEqual([
      '{ Player } -> { DOWN Player }'
    ]);
  });

  it('expands { HORIZONTAL } -> { _ }', ()=> {
    const ruleLeft = '{ HORIZONTAL Player } -> { Player }'

    expect(expandRules([ruleLeft], standardExpansions)).toEqual([
      '{ LEFT Player } -> { Player }',
      '{ RIGHT Player } -> { Player }'
    ]);
  });

  it('expands { _ } -> { HORIZONTAL }', ()=> {
    const ruleRight = '{ Player } -> { HORIZONTAL Player }'

    expect(expandRules([ruleRight], standardExpansions)).toEqual([
      '{ Player } -> { LEFT Player }',
      '{ Player } -> { RIGHT Player }'
    ]);
  });

  it('expands { <HORIZONTAL> } -> { HORIZONTAL }', ()=> {
    const ruleBoth = '{ <HORIZONTAL> Player } -> { HORIZONTAL Player }'

    expect(expandRules([ruleBoth], standardExpansions)).toEqual([
      '{ <LEFT> Player } -> { LEFT Player }',
      '{ <RIGHT> Player } -> { RIGHT Player }'
    ]);
  });
});

describe('expanding collision rules', ()=> {
  it('expands collision rule with ALL', ()=> {
    const rule = 'ALL { Player | Goomba } -> { DEAD Player | Goomba }'

    expect(expandRules([rule], standardExpansions)).toEqual([
      'UP { Player | Goomba } -> { DEAD Player | Goomba }',
      'DOWN { Player | Goomba } -> { DEAD Player | Goomba }',
      'LEFT { Player | Goomba } -> { DEAD Player | Goomba }',
      'RIGHT { Player | Goomba } -> { DEAD Player | Goomba }'
    ]);
  });

  it('expands { HORIZONTAL | _ } -> { _ | _ }', ()=> {
    const horizontalA = 'DOWN { HORIZONTAL Player | Goomba } -> { DEAD Player | Goomba }'

    expect(expandRules([horizontalA], standardExpansions)).toEqual([
      'DOWN { LEFT Player | Goomba } -> { DEAD Player | Goomba }',
      'DOWN { RIGHT Player | Goomba } -> { DEAD Player | Goomba }',
    ]);
  });

  it('expands { _ | HORIZONTAL } -> { _ | _ }', ()=> {
    const horizontalB = 'DOWN { Player | HORIZONTAL Goomba } -> { DEAD Player | Goomba }'

    expect(expandRules([horizontalB], standardExpansions)).toEqual([
      'DOWN { Player | LEFT Goomba } -> { DEAD Player | Goomba }',
      'DOWN { Player | RIGHT Goomba } -> { DEAD Player | Goomba }',
    ]);
  });

  it('expands { _ | _ } -> { HORIZONTAL | _ }', ()=> {
    const horizontalC = 'DOWN { Player | Goomba } -> { HORIZONTAL DEAD Player | Goomba }'

    expect(expandRules([horizontalC], standardExpansions)).toEqual([
      'DOWN { Player | Goomba } -> { LEFT DEAD Player | Goomba }',
      'DOWN { Player | Goomba } -> { RIGHT DEAD Player | Goomba }',
    ]);
  });

  it('expands { _ | _ } -> { _ | HORIZONTAL }', ()=> {
    const horizontalD = 'DOWN { Player | Goomba } -> { DEAD Player | HORIZONTAL Goomba }'

    expect(expandRules([horizontalD], standardExpansions)).toEqual([
      'DOWN { Player | Goomba } -> { DEAD Player | LEFT Goomba }',
      'DOWN { Player | Goomba } -> { DEAD Player | RIGHT Goomba }',
    ]);
  });

  it('expands { HORIZONTAL | HORIZONTAL } -> { _ | _ }', ()=> {
    const horizontalComboA = 'DOWN { HORIZONTAL Player | HORIZONTAL Goomba } -> { DEAD Player | Goomba }'

    expect(expandRules([horizontalComboA], standardExpansions)).toEqual([
      'DOWN { LEFT Player | LEFT Goomba } -> { DEAD Player | Goomba }',
      'DOWN { RIGHT Player | RIGHT Goomba } -> { DEAD Player | Goomba }',
    ]);
  });

  it('expands { _ | _ } -> { HORIZONTAL | HORIZONTAL }', ()=> {
    const horizontalComboB = 'DOWN { Player | Goomba } -> { HORIZONTAL DEAD Player | HORIZONTAL Goomba }'

    expect(expandRules([horizontalComboB], standardExpansions)).toEqual([
      'DOWN { Player | Goomba } -> { LEFT DEAD Player | LEFT Goomba }',
      'DOWN { Player | Goomba } -> { RIGHT DEAD Player | RIGHT Goomba }',
    ]);
  });
});

describe('parsing variable declarations', ()=> {
  it('parses { nested variable declaration } -> { ... }', ()=> {
    const declaration = 'RIGHTIO = { velocity: { x: 1 } }'

    expect(parseObjects(declaration)).toEqual(
      {RIGHTIO: ['velocity: { x: 1 }']},
    );
  });

  it('parses { list declaration } -> { ... }', ()=> {
    const declaration = 'MY_LIST = [ Goomba Player Squid ]'

    expect(parseLists(declaration)).toEqual(
      {MY_LIST: ['Goomba', 'Player', 'Squid']},
    );
  });
});

describe('expanding custom variables', ()=> {
  it('expands { CUSTOM_TEST } -> { ... }', ()=> {
    const ruleLeft = '{ Player CUSTOM_TEST } -> { Player }'
    const customExpansions = {CUSTOM_TEST: ['velocity: { y: 6 }']}

    expect(expandRules([ruleLeft], customExpansions)).toEqual([
      '{ Player velocity: { y: 6 } } -> { Player }',
    ]);
  });
});

describe('addImplicitKeywords', ()=> {
  it('adds implicit keywords to collision rule', ()=> {
    const rule = '{ Player | Goomba } -> { DEAD Player | Goomba }'

    expect(addImplicitKeywords(rule))
      .toEqual('ALL { Player | Goomba } -> { DEAD Player | Goomba }');
  });
});