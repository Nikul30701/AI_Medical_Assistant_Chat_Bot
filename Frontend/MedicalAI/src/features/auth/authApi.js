import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Custom base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  try {
    const result = await fetchBaseQuery({
      baseUrl: `${BASE_URL}/api/accounts/`,
      credentials: 'include',
      timeout: 5000, // 5 second timeout
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.accessToken;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
      },
    })(args, api, extraOptions);
    
    return result;
  } catch (error) {
    console.error('API connection error:', error);
    return {
      error: {
        status: 500,
        data: {
          message: 'Unable to connect to server. Please check if the backend is running.'
        }
      }
    };
  }
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'register/',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'logout/',
        method: 'POST',
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: 'token/refresh/',
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query({
      query: () => 'me/',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
} = authApi;
