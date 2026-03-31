// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken:     localStorage.getItem('accessToken')  || null,
    refreshToken:    localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
  },
  reducers: {
    setCredentials: (state, { payload: { user, access, refresh } }) => {
      state.user = user; state.accessToken = access; state.refreshToken = refresh; state.isAuthenticated = true
      localStorage.setItem('accessToken',  access)
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('user', JSON.stringify(user))
    },
    updateAccessToken: (state, { payload }) => {
      state.accessToken = payload; 
      localStorage.setItem('accessToken', payload)
    },
    updateTokens: (state, { payload: { access, refresh } }) => {
      state.accessToken = access; 
      state.refreshToken = refresh;
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
    },
    logout: (state) => {
      Object.assign(state, { user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      localStorage.clear()
    },
  },
})
export const { setCredentials, updateAccessToken, updateTokens, logout } = authSlice.actions
export default authSlice.reducer
export const selectCurrentUser     = (s) => s.auth.user
export const selectAccessToken     = (s) => s.auth.accessToken
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated
