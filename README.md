# Micro gg

Micro gg is a simple rules based language for making games

Use it online here: <https://waynetron.github.io/micro-gg>

![alt text](gifs/simple-platformer-example.gif "Simple platformer example")

## How does it work?

Let's break down a super simple example

![alt text](gifs/simple-game-screenshot.png "Micro gg screenshot")

# Level
```
###############
#             #
#             #
#  P       X  #
###############
```
Levels are drawn with ascii.


# Legend
```
P = Player
X = Goal
```

This lets the game know which keywords map to which ascii characters in our level above
The ascii characters and keywords you use aren't limited to those in the examples and could be anything. Eg:: ```! = NicolasCage```


# Rules
Rules define how the game world works. They consist of a left state and a right state separated by an arrow.
If the state on the left is matched, it is replaced with the state on the right.

``` { <RIGHT> Player } -> { RIGHT Player } ```

```<RIGHT>``` (with the brackets) is an input and ```RIGHT``` (without the brackets) is a movement.
So what this rule is saying is: If the game sees the <RIGHT> key is pressed and also a Player, then move that Player to the right.

```
{ Player | Goal } -> { Player WIN | Goal }
```
The pipe character ```|``` represents touching
What this rule is saying is: If a Player is touching a Goal. Then that Player wins.

That's close to the simplest possible thing you can make with Micro gg. For more involved examples, check the example code from within the app.