import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/API';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    // RTK Query auto-generated reducer (caches all API data)
    [api.reducerPath]: api.reducer,

    // Auth slice – tokens, user, isAuthenticated
    auth: authReducer,
  },

  // RTK Query middleware handles caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),

  devTools: import.meta.env.DEV, // enable Redux DevTools only in development
});