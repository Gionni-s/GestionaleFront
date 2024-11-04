import { createSlice } from "@reduxjs/toolkit"

export const log = createSlice({
  name: "Log",
  initialState: {
    id: undefined,
    log: false,
  },
  reducers: {
    login: (state, actions) => {
      state.log = true
      state.id = actions.payload.id
    },
    logout: (state) => {
      state.log = false
      state.id = undefined
    },
  },
})

// Action creators are generated for each case reducer function
export const { login, logout } = log.actions

export default log.reducer
