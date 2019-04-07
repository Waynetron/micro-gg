# Micro gg

Micro gg is a simple rules based language for making games


## How does it work?

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
```

Create things simply naming them in the legend
```
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
