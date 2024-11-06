import { createSlice } from "@reduxjs/toolkit";
import { initializeSocket } from "../actions/socketActions";

const initialState = {
  socket: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(initializeSocket.fulfilled, (state, action) => {
      state.socket = action.payload;
    });
  },
});

export default socketSlice.reducer;
