import React, {useState, Fragment} from 'react'
import {connect} from 'react-redux'
import Textarea from 'react-textarea-autosize'
import Plain from 'slate-plain-serializer'
import {examples} from './exampleCode'
import Button from '../components/Button'
import Modal from '../components/Modal'
import styled from 'styled-components'

const CodeExample = styled.div`
  padding: 1.5rem;
  margin-bottom: 1rem;
  background-color: ${props => props.colors.dark};
  border-radius: 0.5rem;

  textarea {
    background-color: transparent;
    color: var(--primary-color);
    padding: 0rem;
    border: none;
    overflow: hidden;
    resize: none;
    outline: none;
    line-height: 1rem;
    font-family: 'Fira Code';
    font-size: 1rem;
    width: 100%;
    padding: 0;
  }
`

const ColumnLayout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
`

const ExamplesModal = ({colors, loadPreset})=> {
  const [visible, setVisible] = useState(false)

  return visible 
  ?
    <Modal colors={colors} onClose={()=> setVisible(false)}>
      <h1>Examples</h1>
      {Object.entries(examples).map(([key, code])=> {
        
        return <Fragment key={key}>
          <ColumnLayout>
            <h2>{key}</h2>
            <Button colors={colors} secondary onClick={()=> {
              loadPreset(code)
              setVisible(false)
            }}>
              Load
            </Button>
          </ColumnLayout>
          <CodeExample colors={colors}>
            <Textarea value={code} />
          </CodeExample>
        </Fragment>
      }
      )}
    </Modal>
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
