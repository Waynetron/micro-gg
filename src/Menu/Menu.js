import React from 'react';
import Button from '../components/Button'
import './Menu.scss';

const text = {
  win: 'Win.',
  lose: 'Lose.',
}

export const Menu = ({width, height, onPlay, colors, currentView})=> (
  <div className='menu' style={{width, height}}>
    <h1 className='title'>{text[currentView]}</h1>
    <Button colors={colors} inverted onClick={onPlay}>
      Play again
    </Button>
  </div>
);