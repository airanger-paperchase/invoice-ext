import { createSlice } from '@reduxjs/toolkit';

const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    shouldRefresh: false,
  },
  reducers: {
    triggerRefresh: (state) => {
      state.shouldRefresh = !state.shouldRefresh;
    },
  },
});

export const { triggerRefresh } = documentSlice.actions;
export default documentSlice.reducer;
