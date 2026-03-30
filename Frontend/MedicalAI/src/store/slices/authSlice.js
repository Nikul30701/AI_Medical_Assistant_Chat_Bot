import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',

    initialState: {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
    },

    reducers: {
        setCredentials: (state, { payload }) => {
            const { user, access, refresh } = payload;

            // Basic validation
            if (!user || !access) {
                console.warn('setCredentials called with invalid payload');
                return;
            }

            state.user = user;
            state.accessToken = access;
            state.refreshToken = refresh || null;
            state.isAuthenticated = true;

            // Persist to localStorage
            try {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('accessToken', access);
                if (refresh) {
                    localStorage.setItem('refreshToken', refresh);
                } else {
                    localStorage.removeItem('refreshToken');
                }
            } catch (error) {
                console.error('Failed to save auth data to localStorage:', error);
            }
        },

        updateAccessToken: (state, { payload }) => {
            if (!payload) return;

            state.accessToken = payload;
            try {
                localStorage.setItem('accessToken', payload);
            } catch (error) {
                console.error('Failed to update accessToken in localStorage:', error);
            }
        },

        logout: (state) => {
            // Reset state
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;

            // Clear localStorage
            try {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
            }
        },
    },
});

// Export actions
export const { setCredentials, updateAccessToken, logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors (memoization-friendly)
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;