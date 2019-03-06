import {expandRules} from './parse'

describe('expanding regular rules', ()=> {
  it('expands ALL', ()=> {
    const rule = 'ALL [ Player ] -> [ DOWN Player ]'

    expect(expandRules([rule])).toEqual([
      'UP [ Player ] -> [ DOWN Player ]',
      'DOWN [ Player ] -> [ DOWN Player ]',
      'LEFT [ Player ] -> [ DOWN Player ]',
      'RIGHT [ Player ] -> [ DOWN Player ]'
    ]);
  });

  it('expands [ HORIZONTAL ] -> [ _ ]', ()=> {
    const ruleLeft = 'DOWN [ HORIZONTAL Player ] -> [ Player ]'

    expect(expandRules([ruleLeft])).toEqual([
      'DOWN [ LEFT Player ] -> [ Player ]',
      'DOWN [ RIGHT Player ] -> [ Player ]'
    ]);
  });

  it('expands [ _ ] -> [ HORIZONTAL ]', ()=> {
    const ruleRight = 'DOWN [ Player ] -> [ HORIZONTAL Player ]'

    expect(expandRules([ruleRight])).toEqual([
      'DOWN [ Player ] -> [ LEFT Player ]',
      'DOWN [ Player ] -> [ RIGHT Player ]'
    ]);
  });

  it('expands [ <HORIZONTAL> ] -> [ HORIZONTAL ]', ()=> {
    const ruleBoth = 'DOWN [ <HORIZONTAL> Player ] -> [ HORIZONTAL Player ]'

    expect(expandRules([ruleBoth])).toEqual([
      'DOWN [ <LEFT> Player ] -> [ LEFT Player ]',
      'DOWN [ <RIGHT> Player ] -> [ RIGHT Player ]'
    ]);
  });

  it('expands rule with both ALL and HORIZONTAL', ()=> {
    const horizontalNoDirection = 'ALL [ HORIZONTAL Player ] -> [ DEAD Player ]'

    expect(expandRules([horizontalNoDirection])).toEqual([
      'UP [ LEFT Player ] -> [ DEAD Player ]',
      'UP [ RIGHT Player ] -> [ DEAD Player ]',
      'DOWN [ LEFT Player ] -> [ DEAD Player ]',
      'DOWN [ RIGHT Player ] -> [ DEAD Player ]',
      'LEFT [ LEFT Player ] -> [ DEAD Player ]',
      'LEFT [ RIGHT Player ] -> [ DEAD Player ]',
      'RIGHT [ LEFT Player ] -> [ DEAD Player ]',
      'RIGHT [ RIGHT Player ] -> [ DEAD Player ]'
    ]);
  });
});


describe('expanding collision rules', ()=> {
  it('expands collision rule with ALL', ()=> {
    const rule = 'ALL [ Player | Goomba ] -> [ DEAD Player | Goomba ]'

    expect(expandRules([rule])).toEqual([
      'UP [ Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'LEFT [ Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'RIGHT [ Player | Goomba ] -> [ DEAD Player | Goomba ]'
    ]);
  });

  it('expands [HORIZONTAL | _ ] -> [ _ | _ ]', ()=> {
    const horizontalA = 'DOWN [ HORIZONTAL Player | Goomba ] -> [ DEAD Player | Goomba ]'

    expect(expandRules([horizontalA])).toEqual([
      'DOWN [ LEFT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ RIGHT Player | Goomba ] -> [ DEAD Player | Goomba ]',
    ]);
  });

  it('expands [ _ | HORIZONTAL ] -> [ _ | _ ]', ()=> {
    const horizontalB = 'DOWN [ Player | HORIZONTAL Goomba ] -> [ DEAD Player | Goomba ]'

    expect(expandRules([horizontalB])).toEqual([
      'DOWN [ Player | LEFT Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ Player | RIGHT Goomba ] -> [ DEAD Player | Goomba ]',
    ]);
  });

  it('expands [ _ | _ ] -> [ HORIZONTAL | _ ]', ()=> {
    const horizontalC = 'DOWN [ Player | Goomba ] -> [ HORIZONTAL DEAD Player | Goomba ]'

    expect(expandRules([horizontalC])).toEqual([
      'DOWN [ Player | Goomba ] -> [ LEFT DEAD Player | Goomba ]',
      'DOWN [ Player | Goomba ] -> [ RIGHT DEAD Player | Goomba ]',
    ]);
  });

  it('expands [ _ | _ ] -> [ _ | HORIZONTAL ]', ()=> {
    const horizontalD = 'DOWN [ Player | Goomba ] -> [ DEAD Player | HORIZONTAL Goomba ]'

    expect(expandRules([horizontalD])).toEqual([
      'DOWN [ Player | Goomba ] -> [ DEAD Player | LEFT Goomba ]',
      'DOWN [ Player | Goomba ] -> [ DEAD Player | RIGHT Goomba ]',
    ]);
  });

  it('expands [ HORIZONTAL | HORIZONTAL ] -> [ _ | _ ]', ()=> {
    const horizontalComboA = 'DOWN [ HORIZONTAL Player | HORIZONTAL Goomba ] -> [ DEAD Player | Goomba ]'

    expect(expandRules([horizontalComboA])).toEqual([
      'DOWN [ LEFT Player | LEFT Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ RIGHT Player | RIGHT Goomba ] -> [ DEAD Player | Goomba ]',
    ]);
  });

  it('expands [ _ | _ ] -> [ HORIZONTAL | HORIZONTAL ]', ()=> {
    const horizontalComboB = 'DOWN [ Player | Goomba ] -> [ HORIZONTAL DEAD Player | HORIZONTAL Goomba ]'

    expect(expandRules([horizontalComboB])).toEqual([
      'DOWN [ Player | Goomba ] -> [ LEFT DEAD Player | LEFT Goomba ]',
      'DOWN [ Player | Goomba ] -> [ RIGHT DEAD Player | RIGHT Goomba ]',
    ]);
  });
});
