import { createSlice } from "@reduxjs/toolkit";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AuthState {}

const initialState: AuthState = {};

export const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    actionLogout(state) {
      console.info(state);
    },
  },

  extraReducers: (builder) => {
    console.info(builder);
  },
});

export const { actionLogout } = slice.actions;

export default slice.reducer;
