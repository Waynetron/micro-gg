import React, {useState, Fragment} from 'react';
import {connect} from 'react-redux'
import Textarea from 'react-textarea-autosize';
import {examples} from './exampleCode';

const ExamplesModal = ()=> {
  const [visible, setVisible] = useState(true)

  return visible 
  ?
    <div className='blanket' onClick={()=> setVisible(false)}>
      <div className='modal' onClick={(e)=> e.stopPropagation()}>
        <h1>Examples</h1>
        {Object.entries(examples).map(([key, value])=> 
          <Fragment key={key}>
            <h2>{key}</h2>
            <div className='example'>
              <Textarea value={value} />
            </div>
          </Fragment>
        )}
      </div>
    </div>
  :
    <button className='primary' onClick={()=> setVisible(true)}>
      Examples
    </button>
}

const mapStateToProps = ()=> ({})

const mapDispatchToProps = (dispatch)=> ({
  loadPreset: (value)=> {
    dispatch({type: 'code/LOAD_PRESET', value})
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExamplesModal);
