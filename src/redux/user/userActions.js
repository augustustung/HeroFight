export const actionTypes = Object.freeze({
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: 'LOGOUT_USER'
})

export const login = (data) => ({
  type: actionTypes.LOGIN_USER,
  payload: data
})

export const logout = () => ({
  type: actionTypes.LOGOUT_USER
})