import React from 'react';

const safelyLoadSrc = (img)=> {
  const images = ['player'];
  return images.includes(img)
    ? require(`./images/${img}.png`)
    : null
};

const getPositionStyle = (x, y)=> ({
  position: 'relative', left: x, top: y
});

const Sprite = ({x, y, img})=> (
  <div
    id="sprite"
    style={getPositionStyle(x, y)}
  >
    <img src={safelyLoadSrc(img)} />
  </div>
);

export default Sprite;
