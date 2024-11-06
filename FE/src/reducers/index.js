import { combineReducers } from "redux";
import auth from "./auth";
import message from "./message";
import channels from "./channelReducer";
import servers from "./serverReducer";
import socket from "./socketReducer";
import user from "./userReducer";
import onlineUsers from "./onlineUserReducer";

export default combineReducers({
  auth,
  message,
  channels,
  servers,
  socket,
  user,
  onlineUsers,
});
