import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface initialStateTypes {
  isSidebarCollapsed: boolean;
  isAuthStatus: boolean;
}

const initialState: initialStateTypes = {
  isSidebarCollapsed: false,
  isAuthStatus: false,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsAuthStatus: (state, action: PayloadAction<boolean>) => {
      state.isAuthStatus = action.payload;
    },
  },
});

export const { setIsSidebarCollapsed, setIsAuthStatus } = globalSlice.actions;
export default globalSlice.reducer;
