import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../features/posts/postsSlice";
import usersReducer from "../features/users/usersSlice";

export const store = configureStore({
  reducer: {
    posts: postsReducer, // posts is the name of the slice of posts state
    users: usersReducer, // users is the name of the slice of users state
  },
});
