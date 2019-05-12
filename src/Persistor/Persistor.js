import {useEffect} from 'react'
import {connect} from 'react-redux'
import firebase from '../firebase.js'
import 'firebase/auth'
import Plain from 'slate-plain-serializer'


const firestore = firebase.firestore()

const Persister = ({user, name, id, code, loadGames, clearGames, saveGame})=> {

  // load games as soon as user is signed in and whenever user changes
  useEffect(() => {
    if (user) {
      loadGames(user)
    }
    else {
      clearGames()
    }
  }, [user])

  // save games whenever a change is made
  useEffect(() => {
    saveGame(name, id, code, user)
  }, [name, id , code])

  return null
}

const mapStateToProps = ({app})=> ({
  user: app.user,
  name: app.name,
  id: app.id,
  code: app.code
})

const mapDispatchToProps = (dispatch)=> ({
  saveGame: (name, id, code, user)=> {
    console.log(name, id, code)
    const codeText = Plain.serialize(code)
    firestore.collection(user.uid).doc(id).set({
      name,
      id,
      code: codeText
    })
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  },
  loadGames: (user)=> {
    const gamesRef = firestore.collection(user.uid)
      gamesRef.get().then(function(querySnapshot) {
        let games = []
        querySnapshot.forEach(function(doc) {
          const {name, id, code} = doc.data()
          games.push({name, id, code})
        });
        dispatch({
          type: 'SET_GAMES',
          games
        });
      })
  },
  clearGames: ()=> {
    dispatch({
      type: 'SET_GAMES',
      games: []
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Persister);
