import { actionTypes } from './userActions'

const initialState = {
  isLoggedIn: false,
  data: {}
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_USER:
      return {
        ...state,
        isLoggedIn: true,
        data: action.payload
      }
    case actionTypes.LOGOUT_USER:
      window.location.reload()
      break;
    default:
      return state
  }
}

export default userReducer