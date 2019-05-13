import React from 'react';
import Button from '../components/Button'
import './Menu.scss';

export const Menu = ({width, height, onPlay, colors})=> (
  <div className='menu' style={{width, height}}>
    <h1 className='title'>Win.</h1>
    <Button colors={colors} inverted onClick={onPlay}>
      Play again
    </Button>
  </div>
);