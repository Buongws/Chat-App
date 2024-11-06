import { createAsyncThunk } from "@reduxjs/toolkit";
import socketClusterClient from "socketcluster-client";
import { setOnlineUsers } from "../reducers/onlineUserReducer";

let socketInstance = null; // Singleton instance

export const initializeSocket = createAsyncThunk(
  "socket/initialize",
  async (_, { dispatch }) => {
    // Check if the socket already exists
    if (socketInstance) {
      return socketInstance;
    }

    // Create a new socket if it doesn't exist
    socketInstance = socketClusterClient.create({
      hostname: "localhost",
      port: 3000,
      path: "/socketcluster/",
      query: {
        authToken: localStorage.getItem("socketcluster.authToken"),
      },
    });

    // Subscribe to the "onlineUsers" channel if not already subscribed
    if (!socketInstance.isSubscribed("onlineUsers")) {
      const onlineUsersChannel = socketInstance.subscribe("onlineUsers");

      // Handle online users data stream
      (async () => {
        for await (let data of onlineUsersChannel) {
          dispatch(setOnlineUsers(data));
        }
      })();
    }

    return socketInstance;
  }
);
