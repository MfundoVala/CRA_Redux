import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState = postsAdapter.getInitialState({
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  count: 0,
});

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  console.log("fetchPosts");
  try {
    const response = await axios.get(POSTS_URL);
    // console.log("response.data", response.data);
    return response.data;
  } catch (error) {
    return error.message;
  }
});

export const postNewPost = createAsyncThunk(
  "posts/addNewPost",
  async (initialPost) => {
    console.log("addNewPost");
    try {
      const response = await axios.post(POSTS_URL, {
        userId: initialPost.userId,
        id: initialPost.id,
        title: initialPost.title,
        body: initialPost.content,
        date: new Date().toISOString(),
        reactions: {
          thumbsUp: 0,
          hooray: 0,
          heart: 0,
          rocket: 0,
          eyes: 0,
        },
      });
      return response.data;
    } catch (error) {
      return error.message;
    }
  }
);

export const updatePosts = createAsyncThunk(
  "posts/updatePost",
  async (updatedPost) => {
    try {
      const response = await axios.put(
        `${POSTS_URL}/${updatedPost.id}`,
        updatedPost
      );

      return response.data;
    } catch (error) {
      // return error.message;
      return updatedPost; // if error, return the original post
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId) => {
    try {
      const response = await axios.delete(`${POSTS_URL}/${postId}`);
      if (response?.status === 200) return postId;
      return `${response?.status}: ${response?.statusText}`;
    } catch (error) {
      return error.message;
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setReaction: {
      reducer(state, action) {
        const { postId, reaction } = action.payload;
        const existingPost = state.entities[postId];
        if (existingPost) {
          existingPost.reactions[reaction]++;
        }
      },
      prepare(postId, reaction) {
        return {
          payload: { postId, reaction },
        };
      },
    },
    increaseCount(state, action) {
      state.count++;
    },
  },

  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        let min = 1;
        const loadedPosts = action.payload.map((post) => {
          post.date = sub(new Date(), { minutes: min++ }).toISOString();
          post.reactions = {
            thumbsUp: 0,
            hooray: 0,
            heart: 0,
            rocket: 0,
            eyes: 0,
          };
          return post;
        });
        postsAdapter.upsertMany(state, loadedPosts);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(postNewPost.fulfilled, (state, action) => {
        action.payload.userId = action.payload.userId;
        action.payload.date = new Date().toISOString();
        action.payload.reactions = {
          thumbsUp: 0,
          hooray: 0,
          heart: 0,
          rocket: 0,
          eyes: 0,
        };
        console.log("action.payload", action.payload);
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(updatePosts.fulfilled, (state, action) => {
        if (!action.payload) {
          console.log("could not update post");
          console.log("action.payload", action.payload);
          return;
        }
        action.payload.date = new Date().toISOString();

        postsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        if (!action.payload) {
          console.log("could not delete post");
          console.log("action.payload", action.payload);
          return;
        }
        const { id } = action.payload;
        postsAdapter.removeOne(state, id);
      });
  },
});

//selectors

export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;
export const getCount = (state) => state.posts.count;

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter((post) => post.userId === userId)
);

export const { addNewPost, setReaction, increaseCount } = postsSlice.actions; // export the action creator

export default postsSlice.reducer;
