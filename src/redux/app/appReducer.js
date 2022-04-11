import { actionTypes } from './appActions'

const initialState = {
  playerDetail: {},
  currentRoom: {}
}

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_DATA:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}

export default appReducer