import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import documentReducer from './slices/documentSlice'
import chatReducer     from './slices/chatSlice'
import { apiSlice }   from '../services/API'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    document: documentReducer,
    chat:     chatReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
})
