import { createAsyncThunk } from "@reduxjs/toolkit";
import { getChannelsByServerId, createChannel } from "../api/main";

// Fetch channels for a specific server
export const fetchChannelsByServerId = createAsyncThunk(
  "channels/fetchChannelsByServerId",
  async (serverId, { rejectWithValue }) => {
    try {
      const channels = await getChannelsByServerId(serverId);
      return channels;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new channel
export const createNewChannel = createAsyncThunk(
  "channels/createNewChannel",
  async (channelData, { rejectWithValue }) => {

    try {
      const channel = await createChannel(channelData);
      return channel;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
