import { createSlice } from "@reduxjs/toolkit"

export const token = createSlice({
  name: "Token",
  initialState: {
    value: "",
  },
  reducers: {
    addToken: (state, actions) => {
      state.value = actions.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { addToken } = token.actions

export default token.reducer
