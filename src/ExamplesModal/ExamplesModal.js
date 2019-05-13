import React, {useState, Fragment} from 'react'
import {connect} from 'react-redux'
import Textarea from 'react-textarea-autosize'
import Plain from 'slate-plain-serializer'
import {examples} from './exampleCode'
import Button from '../components/Button'

const ExamplesModal = ({colors, loadPreset})=> {
  const [visible, setVisible] = useState(false)

  return visible 
  ?
    <div className='blanket' onClick={()=> setVisible(false)}>
      <div className='modal' onClick={(e)=> e.stopPropagation()}>
        <h1>Examples</h1>
        {Object.entries(examples).map(([key, code])=> {
          
          return <Fragment key={key}>
            <div className='columns'>
              <h2>{key}</h2>
              <Button colors={colors} secondary onClick={()=> {
                loadPreset(code)
                setVisible(false)
              }}>
                Load
              </Button>
            </div>
            <div className='example'>
              <Textarea value={code} />
            </div>
          </Fragment>
        }
        )}
      </div>
    </div>
  :
    <Button colors={colors} onClick={()=> setVisible(true)}>
      Examples
    </Button>
}

const mapStateToProps = ()=> ({})

const mapDispatchToProps = (dispatch)=> ({
  loadPreset: (codeText)=> {
    const code = Plain.deserialize(codeText)

    dispatch({
      type: 'LOAD_CODE',
      code
    })
    dispatch({
      type: 'COMPILE',
      code
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExamplesModal);
