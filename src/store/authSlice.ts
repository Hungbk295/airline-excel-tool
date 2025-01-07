import { createSlice } from '@reduxjs/toolkit';

interface AuthState {}

const initialState: AuthState = {};

export const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    actionLogout(state) {
      console.info(state);
      // TODO: implement action logout
    },
  },

  extraReducers: (builder) => {
    console.info(builder);
    // builder.
    //   // LOGIN ADMIN
  },
});

export const { actionLogout } = slice.actions;

export default slice.reducer;
