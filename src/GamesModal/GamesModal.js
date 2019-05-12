import React, {useState} from 'react'
import {connect} from 'react-redux'
import Plain from 'slate-plain-serializer'

const ExamplesModal = ({games, loadGame})=> {
  const [visible, setVisible] = useState(false)

  return visible 
  ?
    <div className='blanket' onClick={()=> setVisible(false)}>
      <div className='modal' onClick={(e)=> e.stopPropagation()}>
        <h1>Games</h1>
        {games.map(({name, id, code})=>
          <div className='item' key={id}>
            <h2>{name}</h2>
            <button className='secondary' onClick={()=> {
              loadGame(code)
              setVisible(false)
            }}>
              Load
            </button>
          </div>
        )}
      </div>
    </div>
  :
    <button className='primary' onClick={()=> setVisible(true)}>
      Games
    </button>
}

const mapStateToProps = ({app})=> ({
  games: app.games
})

const mapDispatchToProps = (dispatch)=> ({
  loadGame: (codeText)=> {
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
