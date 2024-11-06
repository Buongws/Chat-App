//Online User reducer (it receives data from socket cluster from channel onlineUsers)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    onlineUsers: [],
    };

const onlineUserSlice = createSlice({
    name: "onlineUsers",
    initialState,
    reducers: {
        setOnlineUsers(state, action) {
            state.onlineUsers = action.payload;
        },
        
    },
});

export const { setOnlineUsers } = onlineUserSlice.actions;

export default onlineUserSlice.reducer;