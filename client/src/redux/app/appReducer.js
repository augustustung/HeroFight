import { actionTypes } from './appActions'

const initialState = {
  playerDetail: {},
  currentRoom: {}
}

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_DATA:
      if (!(action.payload && action.payload.playerDetail && Object.keys(action.payload.playerDetail).length > 2)) {
        delete action.payload.playerDetail
      }
      return {
        ...state,
        ...action.payload
      }
    case actionTypes.CLEAR_DATA: {
      return {
        playerDetail: {},
        currentRoom: {}
      }
    }
    default:
      return state
  }
}

export default appReducer