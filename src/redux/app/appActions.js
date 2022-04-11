export const actionTypes = Object.freeze({
  SET_DATA: "SET_DATA"
})

export const setData = (data) => ({
  type: actionTypes.SET_DATA,
  payload: data
})