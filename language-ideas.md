


FALL: [acceleration: [y: -1]]
JUMP: [velocity: [y: -150]]

[ Creature ] -> [ Creature, FALL ]
[Creature, <JUMP>] -> [Creature, [velocity: [y: -150]]]

() => 



Creature = name: 'Creature'


[ Creature <JUMP> ] -> [ Creature JUMP ]
[ Creature <JUMP> ] -> [ Creature velocity: [ y: -150 ] ]
[ name: 'Creature' <JUMP> ] -> [ name: 'Creature' velocity: [ y: -150 ] ]




JUMP: [velocity: [y: -150]]
JUMP: [velocity: [y: -150] sound: 'boing']


* [] is an array
* Items in a collection are separated by spaces
ARRAY: [ one two three ]

* {} is an object
FALL = {acceleration: {y: -1}}

{ Creature } -> { Creature, FALL }
* FALL is expanded to create:
{ Creature } -> { Creature acceleration: {y: -1} }


* Random idea |x| = not colliding
Flying_player = { Player |x| Ground }
{ Flying_player } -> { Flying_player RIGHT }


* How to differentiate between objects and arrays
* Eg: velocity is object whereas colliding.top is array
<LEFT> = {inputs: {left: true}}

* Steps from rule to state
C = Creature
FALL = {acceleration: {y: -1}}
{ Creature FALL }
* becomes
{ ...{name: 'Creature', ...etc}, ...{acceleration: {y: -1}} }

* Array example
Ground = [Grass Stone Wood]

{ Player | Ground } -> { Player DEAD }
{ Player | [Grass Stone Wood] } -> { Player DEAD }

* -----------------------------------
* Ideas around storing state on a sprite
Ground = [Grass Stone Wood]
Grounded = {isGrounded: true}
Airborne = { Player !Grounded }

{ Player <ACTION1> | Box } -> { Player carrying: Box | DEAD Box }

{ Player <ACTION1> carrying: Box } -> { Player | Box }


* -----------------------------------
* Ideas around custom expansion keywords
HORIZONTAL = LEFT or RIGHT
VERTICAL = UP or DOWN
{ Creature HORIZONTAL }
* becomes
[{ Creature LEFT }, { Creature RIGHT }]

* this seems to work
{ Creature <HORIZONTAL> } -> { Creature HORIZONTAL }
[
  { Creature <LEFT> } -> { Creature LEFT },
  { Creature <RIGHT> } -> { Creature HORIZONTAL }
]

* this almost works. But it's not obvious what should happen
{ Creature <HORIZONTAL> } -> { Creature VERTICAL }
[
  { Creature <LEFT> } -> { Creature UP },
  { Creature <RIGHT> } -> { Creature DOWN }
]

* but what about a more complicated example
* if it can't match directly it probably shouldn't try at all
TOO_MANY = ONE or TWO or THREE
{ Creature <HORIZONTAL> } -> { Creature TOO_MANY }
[
  { Creature <LEFT> } -> { Creature TOO_MANY },
  { Creature <RIGHT> } -> { Creature TOO_MANY }
]