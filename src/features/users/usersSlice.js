import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const initialState = [];

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  console.log("fetchUsers");
  const response = await axios.get(USERS_URL);
  console.log("users", response.data);
  return response.data;
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: {
      reducer(state, action) {
        const { id, name } = action.payload;
        state.push(action.payload);
      },
      prepare(id, name) {
        return {
          payload: {
            id,
            name,
          },
        };
      },
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const selectAllUsers = (state) => state.users;
export const selectUserById = (state, userId) =>
  state.users.find((user) => user.id === userId);
export const { addUser } = usersSlice.actions;
export default usersSlice.reducer;
