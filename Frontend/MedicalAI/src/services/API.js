import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials, setInitialized } from '../features/auth/authSlice';

// A local variable to store the refresh promise.
// This acts as a mutex: if multiple requests fail with 401 simultaneously, 
// they'll all wait for this same promise to resolve.
let refreshPromise = null;

// ---------------------------------------------------------------------------
// 1. Base query – browser automatically handles httpOnly cookies
// ---------------------------------------------------------------------------
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api/',
  prepareHeaders: (headers) => {
    // Note: We no longer manually attach the Authorization header.
    // The browser will include httpOnly cookies automatically because we've 
    // set credentials: 'include'.
    return headers;
  },
  // Ensure cookies are sent with every request
  credentials: 'include',
});

// ---------------------------------------------------------------------------
// 2. Wrapper that silently refreshes the token on a 401 using a mutex
// ---------------------------------------------------------------------------
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Wait for any existing refresh to finish before proceeding with child requests
  if (refreshPromise) {
    await refreshPromise;
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    if (!refreshPromise) {
      // Start a single refresh request for all concurrent 401s
      refreshPromise = (async () => {
        try {
          const refreshResult = await baseQuery(
            {
              url: 'accounts/refresh/',
              method: 'POST',
            },
            api,
            extraOptions,
          );

          if (refreshResult?.data) {
            // Success: backend updated the access_token cookie
            // We can also trigger a profile fetch here if needed
          } else {
            // Refresh failed (cookie expired or invalid)
            api.dispatch(logout());
          }
        } finally {
          // Clear the pending promise once done
          refreshPromise = null;
        }
      })();
    }

    // All original 401 requests wait for the same refreshPromise
    await refreshPromise;

    // Retry the original request (now with a new access cookie)
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};

// ---------------------------------------------------------------------------
// 3. RTK Query API definition
// ---------------------------------------------------------------------------
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Document', 'DocumentDetail', 'ChatSession', 'ChatMessage'],

  endpoints: (builder) => ({
    // =====================================================================
    //  AUTH  (/api/accounts/)
    // =====================================================================

    /** 
     * Initial auth check on app load 
     * GET /api/accounts/status/ 
     */
    getAuthStatus: builder.query({
      query: () => 'accounts/status/',
      providesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user }));
        } catch (error) {
          dispatch(logout());
        } finally {
          dispatch(setInitialized());
        }
      },
    }),

    /** POST /api/accounts/register/  */
    register: builder.mutation({
      query: (body) => ({
        url: 'accounts/register/',
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user }));
        } catch {}
      },
    }),

    /** POST /api/accounts/login/ */
    login: builder.mutation({
      query: (credentials) => ({
        url: 'accounts/login/',
        method: 'POST',
        body: credentials,
      }),
      // On login success, clear the cache and refetch status
      invalidatesTags: ['User', 'Document', 'DocumentDetail', 'ChatSession', 'ChatMessage'],
    }),

    /** POST /api/accounts/logout/ */
    logout: builder.mutation({
      query: () => ({
        url: 'accounts/logout/',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
          // Clear all cached data on logout
          dispatch(api.util.resetApiState());
        }
      },
    }),

    // =====================================================================
    //  DOCUMENTS  (/api/documents/)
    // =====================================================================

    getDocuments: builder.query({
      query: ({ search = '', status = '', page = 1 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (page > 1) params.append('page', page);
        return `documents/?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({ type: 'Document', id })),
              { type: 'Document', id: 'LIST' },
            ]
          : [{ type: 'Document', id: 'LIST' }],
    }),

    getDocumentDetail: builder.query({
      query: (id) => `documents/${id}/`,
      providesTags: (result, error, id) => [{ type: 'DocumentDetail', id }],
    }),

    uploadDocument: builder.mutation({
      query: (formData) => ({
        url: 'documents/upload/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Document', id: 'LIST' }],
    }),

    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `documents/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Document', id },
        { type: 'Document', id: 'LIST' },
        { type: 'DocumentDetail', id },
      ],
    }),

    // =====================================================================
    //  CHAT  (/api/chat/)
    // =====================================================================

    getChatSession: builder.query({
      query: (documentId) => `chat/${documentId}/`,
      providesTags: (result, error, documentId) => [
        { type: 'ChatSession', id: documentId },
      ],
    }),

    getChatMessages: builder.query({
      query: ({ documentId, cursor }) => {
        const params = new URLSearchParams();
        if (cursor) params.append('cursor', cursor);
        return `chat/${documentId}/messages/?${params.toString()}`;
      },
      providesTags: (result, error, { documentId }) => [
        { type: 'ChatMessage', id: documentId },
      ],
    }),

    /** POST /api/chat/:documentId/messages/ (assuming chat API handles creation) */
    sendMessage: builder.mutation({
      query: ({ documentId, content }) => ({
        url: `chat/${documentId}/messages/`, // Adjust this URL based on your backend view for sending messages
        method: 'POST',
        body: { content },
      }),
      // Invalidate both session and message list to trigger refresh
      invalidatesTags: (result, error, { documentId }) => [
        { type: 'ChatSession', id: documentId },
        { type: 'ChatMessage', id: documentId },
      ],
    }),
  }),
});

export const {
  // Auth
  useGetAuthStatusQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,

  // Documents
  useGetDocumentsQuery,
  useGetDocumentDetailQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,

  // Chat
  useGetChatSessionQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
} = api;