import {
  applyMiddleware, compose,
  createStore, combineReducers
} from 'redux'
import thunk from 'redux-thunk'
import blockchainReducer from './blockchain/blockchainReducer'
import dataReducer from './data/dataReducer'
import userReducer from './user/userReducer'

const rootReducer = combineReducers({
  blockchain: blockchainReducer,
  data: dataReducer,
  user: userReducer
})

const middlewares = [thunk]
const composeEnhancers = compose(applyMiddleware(...middlewares))

const configureStore = () => {
  return createStore(rootReducer, composeEnhancers)
}

const store = configureStore()

export default store