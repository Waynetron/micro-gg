import React from 'react'
import {connect} from 'react-redux'
import firebase from '../firebase.js'
import * as firebaseApp from 'firebase/app'
import 'firebase/auth'

import Game from '../Game/Game.js'
import {Menu} from '../Menu/Menu.js'
import Loop from '../Game/Loop.js'
import Code from '../Code/Code.js'
import SpriteEditor from '../SpriteEditor/SpriteEditor'
import Persister from '../Persistor/Persistor'
import ExamplesModal from '../ExamplesModal/ExamplesModal'
import GamesModal from '../GamesModal/GamesModal'
import {toggleTheme} from './actions.js'
import CustomProperties from 'react-custom-properties'
import styled from 'styled-components'

import './App.scss'
import moon from '../icons/moon.svg'
import sun from '../icons/sun.svg'
import play from '../icons/play.svg'
import stop from '../icons/stop.svg'
import {darkColors, lightColors} from './colors'
import Keyboard from '../Keyboard/Keyboard'


const providers = {
  google: new firebaseApp.auth.GoogleAuthProvider(),
}

const alpha = 30; // hex
const Input = styled.input`
  background-color: ${props => props.colors.primary}${alpha};
  &:hover, &:focus{
    background-color: ${props => props.colors.primary}${alpha * 1.5};
  }
  &:focus{
    outline: none;
  }
  color: ${props => props.colors.primary};
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.5rem;
  border: none;
  border-radius: 0.3rem;
`;

const App = ({
    name, id, code, compile, theme, sprites, imageMap, width, height, debug,
    error, isGameActive, currentView, setGameActive, onOpenCloseSpriteEditor,
    onToggleTheme, updateName, user, signOut, signInWithGoogle
})=> {
  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <CustomProperties className="custom-properties-container" properties={{
      '--primary-color': colors.primary,
      '--secondary-color': colors.secondary,
      '--dark-color': colors.dark,
      '--primary-transparent-color': colors.primaryTransparent,
      '--light-color': colors.light,
      '--hover-color': `${colors.primary}22`  // 22 is is the alpha in hex
    }}>
      <div className="main">
        {user && <Persister />}
        <div className="left">
          <header>
            <h1 className='logo'>micro gg</h1>
            <Input
              type="text"
              value={name}
              onChange={(e)=> updateName(e.target.value.toUpperCase())}
              colors={colors}
            />
            <GamesModal />
            <ExamplesModal />
            {
              user
                ? <button onClick={signOut}>Sign out</button>
                : <button onClick={signInWithGoogle}>Sign in with Google to save</button>
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
        <Keyboard>
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
        </Keyboard>
      </div>
    </CustomProperties>
  );
};

const mapStateToProps = ({app, game})=> ({
  user: app.user,
  name: app.name,
  id: app.id,
  code: app.code,
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
  updateName: (name)=> {
    dispatch({
      type: 'SET_NAME',
      name
    });
  },
  signOut: ()=> {
    firebase.auth().signOut().then(function() {
      dispatch({
        type: 'SIGN_OUT'
      });
    }).catch(function(error) {
      console.error('could not sign out')
    });
  },
  signInWithGoogle: ()=> {
    firebase.auth().signInWithPopup(providers.google).then(function(result) {
      // var token = result.credential.accessToken;
      dispatch({
        type: 'SET_USER',
        user: result.user
      });
    }).catch(function(error) {
      console.error(error)
    });
  },
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
  onToggleTheme: ()=> {
    dispatch(toggleTheme());
  },
  onOpenCloseSpriteEditor: (open)=> {
    dispatch({type: 'spriteEditor/SET_OPEN', open: open})
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
