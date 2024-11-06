import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getServersByUserId,
  getServerById,
  createServerByUserId,
  updateServerByServerId,
  getInviteCodeById,
  getUserById,
  updateUserByToken,
  updateChannelById,
  deleteChannelById,
  updateForgotPassword,
  updateUserPassword,
  deleteMemberFromServer,
} from "../api/main";

//
export const fetchUserById = createAsyncThunk(
  "user/detail",
  async (serverId, { rejectWithValue }) => {
    try {
      const server = await getUserById(serverId);
      return server;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all servers for the user
export const fetchServers = createAsyncThunk(
  "servers/fetchServers",
  async (_, { rejectWithValue }) => {
    try {
      const servers = await getServersByUserId();
      return servers.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch a specific server by ID
export const fetchServerById = createAsyncThunk(
  "servers/fetchServerById",
  async (serverId, { rejectWithValue }) => {
    try {
      const server = await getServerById(serverId);
      return server;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch a inviteCode by ServerId
export const fetchInviteCodeById = createAsyncThunk(
  "servers/get-invite-code/fetchServerById",
  async (serverId, { rejectWithValue }) => {
    try {
      const server = await getInviteCodeById(serverId);
      return server;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//Forgot password
export const requestForgotPassword = createAsyncThunk(
  "servers/request-password-reset",
  async (data, { rejectWithValue }) => {
    try {
      const server = await updateForgotPassword(data);
      return server;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new server for the user
export const createServer = createAsyncThunk(
  "servers/createServer",
  async (serverData, { rejectWithValue }) => {
    try {
      const server = await createServerByUserId(serverData);

      return server.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateServer = createAsyncThunk(
  "server/updateServerById",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const server = await updateServerByServerId(id, data);
      return server;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteServerMember = createAsyncThunk(
  "server/deleteServerById",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const server = await deleteMemberFromServer(id, data);
      return server;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUserByToken",
  async (data, { rejectWithValue }) => {
    try {
      const user = await updateUserByToken(data);
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  "user/updateUserPassword",
  async (data, { rejectWithValue }) => {
    try {
      const user = await updateUserPassword(data);
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChannel = createAsyncThunk(
  "channels/updateChannelById",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const channel = await updateChannelById(id, data);
      return channel;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChannel = createAsyncThunk(
  "channels/deleteChannelById",
  async (id, { rejectWithValue }) => {
    try {
      const channel = await deleteChannelById(id);
      return channel;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
