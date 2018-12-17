# Game script #

Game script is a simple rules based language for making games


## Some ideas around how it *might* work ##

// Order should hopefully not matter:
// Can write rules in any order
// Can define functions after using them

// Create things at the start by simply naming them
// Click on the name and you can edit the appearance
// in a little pixel editor to the side (haha, yeah right)
Player, Brick, QuestionBrick, SolidBrick, Spike, Goomba

// Levels can be drawn with ascii
■■■■■■■■■■■■■■■■■■■■■■■
■                     ■
■                     ■
■          G          ■
■     □□□?□□□         ■
■                     ■
■    P                ■
■■■■■■■■■■■■■■■^^^^■■■■

P = Player
? = QuestionBrick
□ = Brick
■ = SolidBrick
S = Spike
G = Goomba


// Gravity function
Gravity = (Thing) ->
    [ Thing ] -> [ DOWN Thing ]
    [ DOWN Thing ] -> [ DOWN DOWN Thing ]
    [ ETC ]

// Apply gravity to both Player and Goomba
ListOfThings = [Player, Goomba]
Gravity( ListOfThings )

// Break brick with head
[ Player.top ] [ Brick.bottom ] -> [ Player ] [ _ ]

// Hit question brick and spawn mushroom
[ Player.top ] [ QuestionBrick.bottom ] -> [ Player ] [ SolidBrick ] [ Mushroom ]

[ > Player ] [ Spike ] -> [ _ ] [ Spike ]
[ > Player ] [ Brick ] [ Player ] [ Brick ]

// In cases where conflicting rules both apply at
// the same time, the higher specificity wins
[ > Player ] [ Goomba ] [ _ ] [ Player ]
[ > Player.bottom ] [ Goomba.top ] [ Player ] [ _ ]

## Game frameworks I've unsuccessfully tried so far ##
[Flockn](https://github.com/flockn/flockn)
[Phaser] (https://phaser.io)
[React-game-kit] (https://github.com/FormidableLabs/react-game-kit)