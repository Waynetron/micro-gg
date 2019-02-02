# Game script

Game script is a simple rules based language for making games


## Some ideas around how it *might* work

Create things at the start by simply naming them
Click on the name and you can edit the appearance in a little pixel editor to the side (haha, yeah right).

```Player, Brick, QuestionBrick, SolidBrick, Spike, Goomba```

Levels can be drawn with ascii
```
#######################
#                     #
#                     #
#          @          #
#     BBB?BBB         #
#                     #
#    P                #
###############^^^^####

P = Player
? = QuestionBrick
B = Brick
# = SolidBrick
^ = Spike
@ = Goomba or Bird or Banana    // chooses one of these randomly
```

### Apply gravity to Player
This will apply a downward acceleration to any player, regardless of any other attributes

```[ Player ] -> [ DOWN Player ]```

Contrast that to something like this, which would only apply to the player if it wasn't already moving

```[ STATIONARY Player ] -> [ DOWN Player ]```


### Apply gravity to both Player and Goomba

```ListOfThings = [Player, Goomba]```
```[ ListOfThings ] -> [ DOWN ListOfThings ]```


### Break brick with head

```UP [ Player | Brick ] -> [ Player ]```

### Hit question brick and spawn mushroom

```UP [ Player | QuestionBrick ] -> [ Player | SolidBrick | Mushroom ]```


## Game frameworks I've unsuccessfully tried so far ##

[Flockn](https://github.com/flockn/flockn)
[Phaser] (https://phaser.io)
[React-game-kit] (https://github.com/FormidableLabs/react-game-kit)
