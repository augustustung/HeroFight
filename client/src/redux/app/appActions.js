export const actionTypes = Object.freeze({
  SET_DATA: "SET_DATA",
  CLEAR_DATA: "CLEAR_DATA"
})

export const setData = (data) => ({
  type: actionTypes.SET_DATA,
  payload: data
})

export const clearDataAction = () => ({
  type: actionTypes.CLEAR_DATA
})