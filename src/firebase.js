
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

const firebaseInitialized = firebase.initializeApp(config)

firebase.firestore().enablePersistence()
  .catch(function(err) {
      if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
  });
// Subsequent queries will use persistence, if it was enabled successfully

export default firebaseInitialized