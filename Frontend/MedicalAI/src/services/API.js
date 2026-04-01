// src/services/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { updateAccessToken, updateTokens, logout } from '../store/slices/authSlice'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const base = fetchBaseQuery({
  baseUrl: BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.access || getState().auth.accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseWithReauth = async (args, api, extra) => {
  let res = await base(args, api, extra)
  if (res?.error?.status === 401) {
    const refresh = api.getState().auth.refreshToken
    if (refresh) {
      const r = await base({ url: '/accounts/token/refresh/', method: 'POST', body: { refresh } }, api, extra)
      if (r?.data?.access) { 
        // Update both tokens in state
        api.dispatch(updateTokens({ 
          access: r.data.access, 
          refresh: r.data.refresh || refresh 
        }))
        
        // Retry with NEW token directly in headers
        const newAccessToken = r.data.access
        const retryArgs = typeof args === 'string' 
          ? { url: args, headers: { Authorization: `Bearer ${newAccessToken}` } }
          : { ...args, headers: { ...args.headers, Authorization: `Bearer ${newAccessToken}` } }
        
        res = await base(retryArgs, api, extra)
      }
      else api.dispatch(logout())
    } else api.dispatch(logout())
  }
  return res
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseWithReauth,
  tagTypes: ['Document'],
  endpoints: (b) => ({
    // Auth
    register: b.mutation({ query: (body) => ({ url: '/accounts/register/', method: 'POST', body }) }),
    login:    b.mutation({ query: (body) => ({ url: '/accounts/login/',    method: 'POST', body }) }),
    getMe:    b.query({   query: () => '/accounts/me/' }),

    // Documents
    getDocuments:   b.query({ query: (p = {}) => ({ url: '/documents/', params: p }), providesTags: ['Document'] }),
    getDocument:    b.query({ query: (id) => `/documents/${id}/`, providesTags: (r, e, id) => [{ type: 'Document', id }] }),
    uploadDocument: b.mutation({ query: (fd) => ({ url: '/documents/upload/', method: 'POST', body: fd }), invalidatesTags: ['Document'] }),
    deleteDocument: b.mutation({ query: (id) => ({ url: `/documents/${id}/`, method: 'DELETE' }), invalidatesTags: ['Document'] }),

    // Chat
    getChatMessages: b.query({
      query: ({ docId, cursor, pageSize = 20 }) => ({
        url: `/chat/${docId}/messages/`,
        params: { page_size: pageSize, ...(cursor ? { cursor } : {}) },
      }),
    }),
  }),
})

export const {
  useRegisterMutation, useLoginMutation, useGetMeQuery,
  useGetDocumentsQuery, useGetDocumentQuery,
  useUploadDocumentMutation, useDeleteDocumentMutation,
  useGetChatMessagesQuery,
} = apiSlice
