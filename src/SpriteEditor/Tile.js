import React from 'react';
import './Tile.scss';

const getPositionStyle = (x, y)=> ({
  position: 'relative', left: x, top: y
});

const Tile = ({x, y, img, onClick})=> (
  <div className='tile' style={getPositionStyle(x, y)}>
    <img
      src={require(`../Game/images/tiles/${img}.png`)}
      alt=''
      onClick={()=> onClick()}
    />
  </div>
);

export default Tile;
