import {useEffect} from 'react'
import {connect} from 'react-redux'
import firebase from '../firebase.js'
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebaseApp from 'firebase/app'
import 'firebase/auth'


const firestore = firebase.firestore()

const firebaseAppAuth = firebase.auth()
const providers = {
  googleProvider: new firebaseApp.auth.GoogleAuthProvider(),
}

const Loader = ({user, setGames, setUser})=> {

  // create new game data on first load
  useEffect(() => {
    if (user) {
      setUser(user)

      const gamesRef = firestore.collection(user.uid)
      gamesRef.get().then(function(querySnapshot) {
        let games = []
        querySnapshot.forEach(function(doc) {
          const {name, id, code} = doc.data()
          games.push({name, id, code})
        });
        setGames(games)
      })
    }
  }, [user])

  return null
}

const mapStateToProps = ({app})=> ({
  name: app.name,
  id: app.id,
  code: app.code
})

const mapDispatchToProps = (dispatch)=> ({
  setGames: (games)=> {
    dispatch({
      type: 'SET_GAMES',
      games
    });
  },
  setUser: (user)=> {
    dispatch({
      type: 'SET_USER',
      user
    });
  }
});

// magically injects 'user' prop once user logs in
const loaderWithAuth = withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(Loader);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(loaderWithAuth);
