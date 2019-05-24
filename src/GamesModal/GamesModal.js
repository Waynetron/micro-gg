import React, {useState} from 'react'
import {connect} from 'react-redux'
import Plain from 'slate-plain-serializer'
import Button from '../components/Button'
import Modal from '../components/Modal'

const GamesModal = ({colors, games, loadGame})=> {
  const [visible, setVisible] = useState(false)

  return visible 
  ?
    <Modal colors={colors} onClose={()=> setVisible(false)}>
      <h1>Games</h1>
      {games.map(({name, id, code})=>
        <div className='item' key={id}>
          <h2>{name}</h2>
          <Button secondary colors={colors} onClick={()=> {
            loadGame(code)
            setVisible(false)
          }}>
            Load
          </Button>
        </div>
      )}
    </Modal>
  :
    <Button colors={colors} onClick={()=> setVisible(true)}>
      Games
    </Button>
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
)(GamesModal);
