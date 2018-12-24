import React, {useEffect} from 'react';
import {updateSprite} from './actions.js';
import {connect} from 'react-redux'

const Physics = ({elapsed, sprites, onUpdateSprite})=> {
  useEffect(() => {
    // const updatedSprites = sprites.map((sprite)=> {
    //   if (!sprite.static) {
    //     return {
    //       ...sprite,
    //       y: sprite.y + 1
    //     }
    //   }

    //   return sprite;
    // })
  });
  return <p>Physics yo</p>;
};

const mapStateToProps = ({game})=> ({
  elapsed: game.elapsed
});

const mapDispatchToProps = (dispatch)=> ({
  onUpdateSprite: (sprite)=> {
    dispatch(updateSprite(sprite));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Physics);
