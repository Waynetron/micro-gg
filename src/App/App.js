import React, {Fragment, useEffect} from 'react'
import {connect} from 'react-redux'
import {HotKeys} from 'react-hotkeys'
import firebase from '../firebase.js'
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebaseApp from 'firebase/app'
import 'firebase/auth'

import Game from '../Game/Game.js'
import {Menu} from '../Menu/Menu.js'
import Loop from '../Game/Loop.js'
import Code from '../Code/Code.js'
import SpriteEditor from '../SpriteEditor/SpriteEditor'
import ExamplesModal from '../Examples/ExamplesModal'
import {toggleDebug} from '../Game/actions.js'
import {setInput, cancelInput, toggleTheme} from './actions.js'
import CustomProperties from 'react-custom-properties'
import Plain from 'slate-plain-serializer'
import IconButton from '@material-ui/core/IconButton'

import './App.scss'
import moon from '../icons/moon.svg'
import sun from '../icons/sun.svg'
import play from '../icons/play.svg'
import stop from '../icons/stop.svg'
import menu from '../icons/menu.svg'



const firestore = firebase.firestore()

const firebaseAppAuth = firebase.auth()
const providers = {
  googleProvider: new firebaseApp.auth.GoogleAuthProvider(),
}


const darkColors = {
  primary: '#F1A0A0',
  secondary: '#70EFA6',
  dark: '#000000',
  light: '#FDF6E2'
}

const lightColors = {
  primary: '#43153F',
  secondary: '#70EFA6',
  dark: '#FDF6E2',
  light: '#FFFFFF'
}

const keyMap = {
  'up': {sequence: 'up', action: 'keydown'},
  'down': {sequence: 'down', action: 'keydown'},
  'left': {sequence: 'left', action: 'keydown'},
  'right': {sequence: 'right', action: 'keydown'},
  'action1': {sequence: 'x', action: 'keydown'},
  'action2': {sequence: 'z', action: 'keydown'},

  'cancel_up': {sequence: 'up', action: 'keyup'},
  'cancel_down': {sequence: 'down', action: 'keyup'},
  'cancel_left': {sequence: 'left', action: 'keyup'},
  'cancel_right': {sequence: 'right', action: 'keyup'},
  'cancel_action1': {sequence: 'x', action: 'keyup'},
  'cancel_action2': {sequence: 'z', action: 'keyup'},
};

const handlers = (onSetInput, onCancelInput, onReset, onRun, onToggleDebug, isGameActive)=> ({
  'up': ()=> onSetInput('up'),
  'down': ()=> onSetInput('down'),
  'left': ()=> onSetInput('left'),
  'right': ()=> onSetInput('right'),
  'action1': ()=> onSetInput('action1'),
  'action2': ()=> onSetInput('action2'),
  'r': ()=> onReset(),
  'd': ()=> onToggleDebug(),
  'space': ()=> onRun(!isGameActive),

  'cancel_up': ()=> onCancelInput('up'),
  'cancel_down': ()=> onCancelInput('down'),
  'cancel_left': ()=> onCancelInput('left'),
  'cancel_right': ()=> onCancelInput('right'),
  'cancel_action1': ()=> onCancelInput('action1'),
  'cancel_action2': ()=> onCancelInput('action2'),
});

const App = ({
    code, compile, theme, sprites, imageMap, width, height, debug,
    error, isGameActive, currentView, setGameActive, onToggleDebug, onSetInput,
    onCancelInput, onToggleTheme, onOpenCloseSpriteEditor,
    user, signOut, save, load, signInWithGoogle, // Firebase auth
})=> {
  // load data once user is authenticated
  // useEffect(() => {
  //   if (user) {
  //     console.log('loading')
  //     load()
  //   }
  // }, [user])

  const colors = theme === 'light' ? lightColors : darkColors;
  
  return (
    <CustomProperties className="custom-properties-container" properties={{
      '--primary-color': colors.primary,
      '--secondary-color': colors.secondary,
      '--dark-color': colors.dark,
      '--light-color': colors.light,
      '--hover-color': `${colors.primary}22`  // 22 is is the alpha in hex
    }}>
      <div className="main">
        <div className="left">
          <header>
            <h1 className='logo'>micro gg</h1>
            <ExamplesModal />
            {
              user
                ? <Fragment>
                    <button onClick={()=> save(code, user)}>Save</button>
                    <button onClick={()=> load(user)}>Load</button>
                    <button onClick={signOut}>Sign out</button>
                  </Fragment>
                : <Fragment>
                    <button onClick={signInWithGoogle}>Sign in with Google to save</button>
                  </Fragment>
            }
          <button className='icon' onClick={()=> onToggleTheme()}>
            {theme === 'dark'
              ? <img src={sun} alt="Light UI" />
              : <img src={moon} alt="Dark UI" />
            }
          </button>
          </header>
          <Code imageMap={imageMap} />
        </div>
        <HotKeys
          handlers={handlers(
            onSetInput,
            onCancelInput,
            ()=> compile(code),
            (active)=> setGameActive(active),
            ()=> onToggleDebug(),
            isGameActive
          )}
          keyMap={keyMap}
        >
          <div className="right">
            <header>
              {isGameActive
                ? <button className='icon stop' onClick={()=> {
                    compile(code)
                    setGameActive(false)
                  }}>
                    <img src={stop} alt="Stop" />
                  </button>
                : <button className='icon play' onClick={()=> {
                    compile(code)
                    setGameActive(true)
                  }}>
                    <img src={play} alt="Play" />
                  </button>
              }
              {isGameActive && <Loop />}
            </header>
            <div className="game-container">
              <SpriteEditor
                onClose={()=> onOpenCloseSpriteEditor(false)}
              />
              {currentView === 'game'
                ? <Game
                    sprites={sprites}
                    imageMap={imageMap}
                    width={width}
                    height={height}
                    debug={debug}
                    error={error}
                  />
                : <Menu
                    width={width}
                    height={height}
                  />
              }
            </div>
          </div>
        </HotKeys>
      </div>
    </CustomProperties>
  );
};

const mapStateToProps = ({code, game})=> ({
  code: code.code,
  theme: game.theme,
  isGameActive: game.active,
  sprites: game.sprites,
  imageMap: game.imageMap,
  width: game.width,
  height: game.height,
  debug: game.debug,
  error: game.error,
  currentView: game.currentView
})

const mapDispatchToProps = (dispatch)=> ({
  compile: (code)=> {
    dispatch({
      type: 'COMPILE',
      code
    });
  },
  setGameActive: (active)=> {
    dispatch({
      type: 'SET_ACTIVE',
      active
    });
  },
  onSetInput: (input)=> {
    dispatch(setInput(input));
  },
  onCancelInput: (input)=> {
    dispatch(cancelInput(input));
  },
  onToggleDebug: ()=> {
    dispatch(toggleDebug());
  },
  onToggleTheme: ()=> {
    dispatch(toggleTheme());
  },
  onOpenCloseSpriteEditor: (open)=> {
    dispatch({type: 'spriteEditor/SET_OPEN', open: open})
  },
  save: (code, user)=> {
    dispatch({type: 'SAVE_START'});

    const docRef = firestore.collection(user.uid).doc('default')
    docRef.set({
        code: Plain.serialize(code)
      })
      .then(function() {
        dispatch({type: 'SAVE_SUCCESS'});
      })
      .catch(function(error) {
        console.error("Error adding document: ", error)
        dispatch({type: 'SAVE_ERROR'});
      })
  
    console.log('saving...')
  },
  load: (user)=> {
    dispatch({type: 'LOAD_START'});
    console.log(user)

    const docRef = firestore.collection(user.uid).doc('default')
    docRef.get().then((doc) => {
      if (!doc.exists) {
        console.error('No doc found')
        return
      }
      
      const {code} = doc.data()

      dispatch({
        type: 'LOAD_SUCCESS',
        code: Plain.deserialize(code)
      })      
    })
  }
});

// magically injects 'user' prop once user logs in
const appWithAuth = withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(appWithAuth);
