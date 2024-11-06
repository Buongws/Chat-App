import { createSlice } from "@reduxjs/toolkit";
import {
  fetchServers,
  fetchServerById,
  createServer,
  updateServer,
} from "../actions/serverActions"; // Import async actions from your actions file

const initialState = {
  servers: [], // List of servers
  selectedServer: null, // Store the selected server data
  loading: false, // Loading state for async actions
  error: null, // Error state for handling errors
};

const serverSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {}, // No local reducers in this case
  extraReducers: (builder) => {
    builder
      // Fetch Servers
      .addCase(fetchServers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServers.fulfilled, (state, action) => {
        state.loading = false;
        state.servers = action.payload;
      })
      .addCase(fetchServers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Server by ID
      .addCase(fetchServerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedServer = action.payload;
      })
      .addCase(fetchServerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Server
      .addCase(createServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createServer.fulfilled, (state, action) => {
        state.loading = false;
        state.servers.push(action.payload);
      })
      .addCase(createServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Server
      .addCase(updateServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.servers.findIndex(
          (server) => server._id === action.payload._id
        );
        if (index !== -1) {
          state.servers[index] = action.payload;
        }
      })
      .addCase(updateServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// No local actions here as we rely on async actions
export default serverSlice.reducer;
