import React, {useState, Fragment} from 'react'
import {connect} from 'react-redux'
import Textarea from 'react-textarea-autosize'
import Plain from 'slate-plain-serializer'
import {examples} from './exampleCode'

const ExamplesModal = ({loadPreset})=> {
  const [visible, setVisible] = useState(false)

  return visible 
  ?
    <div className='blanket' onClick={()=> setVisible(false)}>
      <div className='modal' onClick={(e)=> e.stopPropagation()}>
        <h1>Examples</h1>
        {Object.entries(examples).map(([key, code])=> {
          const level = code.level.trim()
          const legend = code.legend.trim()
          const rules = code.rules.trim()
          
          return <Fragment key={key}>
            <div className='columns'>
              <h2>{key}</h2>
              <button className='secondary' onClick={()=> {
                loadPreset(level, legend, rules)
                setVisible(false)
              }}>
                Load
              </button>
            </div>
            <div className='example'>
              <Textarea value={level + '\n' + legend + '\n' + rules} />
            </div>
          </Fragment>
        }
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
  loadPreset: (levelText, legendText, rulesText)=> {
    const level = Plain.deserialize(levelText)
    const legend = Plain.deserialize(legendText)
    const rules = Plain.deserialize(rulesText)

    dispatch({
      type: 'LOAD_PRESET',
      level, legend, rules
    })
    dispatch({
      type: 'COMPILE',
      level, legend, rules
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExamplesModal);
