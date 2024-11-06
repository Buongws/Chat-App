import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUserById } from "../api/main";

// Fetch user by ID
export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserById",
  async (_, { rejectWithValue }) => {
    try {
      const user = await fetchUserById();
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
