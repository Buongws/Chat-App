import { createSlice } from "@reduxjs/toolkit";
import {
  fetchChannelsByServerId,
  createNewChannel,
} from "../actions/channelActions";

const initialState = {
  channels: [],
  loading: false,
  error: null,
};

const channelSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelsByServerId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChannelsByServerId.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
      })
      .addCase(fetchChannelsByServerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewChannel.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.channels.push(action.payload);
      })
      .addCase(createNewChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default channelSlice.reducer;
