import React, {useEffect} from 'react';
import {updateCode, updateSlateValue, compile} from './actions.js';
import {connect} from 'react-redux';
import uniqid from 'uniqid';
import {Editor} from 'slate-react';
import Plain from 'slate-plain-serializer';
import Tooltip from '@material-ui/core/Tooltip';
import Game from '../Game/Game.js';
import {parseLegend} from '../util/parse.js';
import {createNewSprite} from '../util/state.js';

const renderNode = (props, editor, next)=> {
  const { attributes, children, node } = props

  if (node.text.includes('=')) {
    const legend = parseLegend(node.text);
    const [getName] = Object.values(legend);

    return (
      <Tooltip
        interactive
        title={
          <div className='tooltip-content'>
            <Game
              sprites={[
                {...createNewSprite(getName(), 0, 0), id: uniqid()}
              ]}
              width={32}
              height={32}
            />
            {/* <button className='secondary' onClick={()=> console.log('clicky wicky')}>Edit</button> */}
          </div>
        }
      >
        <span {...attributes} className='rule'>{children}</span>
      </Tooltip>
    )
  }

  return next();
}

const Code = ({code, slateValue, onChange, onCompile})=> {
  // manually trigger code change on first load
  useEffect(() => {
    // onChange(slateValue);
    onCompile(code);
  }, []);

  return <Editor
    className={'code'}
    value={slateValue}
    onChange={onChange}
    renderNode={renderNode}
  />
};

const mapStateToProps = ({code, game})=> ({
  code: code.code,
  slateValue: code.slateValue,
  sprites: game.sprites, 
  width: game.width, 
  height: game.height
})

const mapDispatchToProps = (dispatch)=> ({
  onChange: ({value})=> {
    dispatch(updateCode(Plain.serialize(value)));
    dispatch(updateSlateValue(value));
  },
  onCompile: (code)=> {
    dispatch(compile(code));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Code);
