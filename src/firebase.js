
import * as firebase from 'firebase';
import 'firebase/firestore' // Required for side-effects

const config = {
  apiKey: "AIzaSyBHLFHOl9TSm557CTNB0IARouvjID9eVmA",
  authDomain: "micro-gg.firebaseapp.com",
  databaseURL: "https://micro-gg.firebaseio.com",
  projectId: "micro-gg",
  storageBucket: "micro-gg.appspot.com",
  messagingSenderId: "53073229739"
}

export default firebase.initializeApp(config)