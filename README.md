This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Game script

Game script is a simple rules based language for making games


## Some ideas around how it *might* work

Order should hopefully not matter:
* Can write rules in any order
* Can define functions after using them

Create things at the start by simply naming them
Click on the name and you can edit the appearance in a little pixel editor to the side (haha, yeah right).

```Player, Brick, QuestionBrick, SolidBrick, Spike, Goomba```

Levels can be drawn with ascii
```
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
```


### Gravity function
```
Gravity = (Thing) ->
    [ Thing ] -> [ DOWN Thing ]
    [ DOWN Thing ] -> [ DOWN DOWN Thing ]
    [ ETC ]
```


### Apply gravity to both Player and Goomba

```ListOfThings = [Player, Goomba]```
```Gravity( ListOfThings )```


### Break brick with head

```[ Player.top ] [ Brick.bottom ] -> [ Player ] [ _ ]```

### Hit question brick and spawn mushroom

```[ Player.top ] [ QuestionBrick.bottom ] -> [ Player ] [ SolidBrick ] [ Mushroom ]```

```[ > Player ] [ Spike ] -> [ _ ] [ Spike ]```
```[ > Player ] [ Brick ] [ Player ] [ Brick ]```


### In cases where conflicting rules both apply at the same time, the higher specificity wins

```[ > Player ] [ Goomba ] [ _ ] [ Player ]```
```[ > Player.bottom ] [ Goomba.top ] [ Player ] [ _ ]```


## Game frameworks I've unsuccessfully tried so far ##
[Flockn](https://github.com/flockn/flockn)
[Phaser] (https://phaser.io)
[React-game-kit] (https://github.com/FormidableLabs/react-game-kit)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
