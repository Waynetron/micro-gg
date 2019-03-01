import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, compose, applyMiddleware} from 'redux'
import {ReactActionSocketMiddleware} from 'react-redux-socket/client'
import {persistStore, persistReducer} from 'redux-persist'
import {PersistGate} from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'
import rootReducers from './reducers'
import './index.css'
import './fonts/FiraCode/fira_code.css'
import AppTest from './App/AppTest.js'

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducers)

const middleware = compose(
  applyMiddleware(
    ReactActionSocketMiddleware("ws://localhost:3000/app1")
  ),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)

const store = createStore(
  persistedReducer,
  middleware
)

const persistor = persistStore(store)
// persistor.purge()

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppTest />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
)
