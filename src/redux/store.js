import {
  applyMiddleware, compose,
  createStore, combineReducers
} from 'redux'
import thunk from 'redux-thunk'
import blockchainReducer from './blockchain/blockchainReducer'
import dataReducer from './data/dataReducer'
import userReducer from './user/userReducer'
import appReducer from './app/appReducer'

const rootReducer = combineReducers({
  blockchain: blockchainReducer,
  data: dataReducer,
  user: userReducer,
  app: appReducer
})

const middlewares = [thunk]
const composeEnhancers = compose(applyMiddleware(...middlewares))

const configureStore = () => {
  return createStore(rootReducer, composeEnhancers)
}

const store = configureStore()

export default store