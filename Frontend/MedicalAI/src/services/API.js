// src/services/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { updateAccessToken, logout } from '../store/slices/authSlice'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth?.accessToken
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    // Prevent infinite loop if refresh endpoint itself fails with 401
    if (args.url?.includes('/auth/refresh/')) {
        return baseQuery(args, api, extraOptions)
    }

    let result = await baseQuery(args, api, extraOptions)

    // Handle token expiration
    if (result?.error?.status === 401) {
        const refreshToken = api.getState().auth?.refreshToken

        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: '/auth/refresh/',
                    method: 'POST',
                    body: { refresh: refreshToken },
                },
                api,
                extraOptions
            )

            if (refreshResult?.data?.access) {
                // Update new access token
                api.dispatch(updateAccessToken(refreshResult.data.access))

                // Retry the original request
                result = await baseQuery(args, api, extraOptions)
            } else {
                api.dispatch(logout())
            }
        } else {
            api.dispatch(logout())
        }
    }

    return result
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Document', 'Chat'],

    endpoints: (builder) => ({
        // ====================== AUTH ======================
        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register/',
                method: 'POST',
                body: credentials,
            }),
        }),

        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login/',
                method: 'POST',
                body: credentials,
            }),
        }),

        getMe: builder.query({
            query: () => '/auth/me/',
        }),

        // ====================== DOCUMENTS ======================
        getDocuments: builder.query({
            query: (params = {}) => ({
                url: '/documents/',
                params,
            }),
            providesTags: ['Document'],
        }),

        getDocument: builder.query({
            query: (id) => `/documents/${id}/`,
            providesTags: (result, error, id) => [{ type: 'Document', id }],
        }),

        uploadDocument: builder.mutation({
            query: (formData) => ({
                url: '/documents/upload/',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Document'],
        }),

        deleteDocument: builder.mutation({
            query: (id) => ({
                url: `/documents/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Document'],
        }),

        // ====================== CHAT ======================
        getChatMessages: builder.query({
            query: ({ docId, cursor, pageSize = 20 }) => ({
                url: `/chat/${docId}/messages/`,
                params: {
                    page_size: pageSize,
                    ...(cursor && { cursor }),
                },
            }),
            serializeQueryArgs: ({ queryArgs }) => {
                return `chatMessages-${queryArgs.docId}` // Cache per document
            },
            merge: (currentCache, newItems) => {
                if (!currentCache.results) currentCache.results = []
                if (!newItems.results) return

                // Avoid duplicates when loading more
                const existingIds = new Set(currentCache.results.map(msg => msg.id))
                const uniqueNewItems = newItems.results.filter(msg => !existingIds.has(msg.id))

                currentCache.results.push(...uniqueNewItems)

                // Optional: keep other pagination fields
                if (newItems.next) currentCache.next = newItems.next
            },
            forceRefetch: ({ currentArg, previousArg }) => {
                return currentArg?.docId !== previousArg?.docId ||
                       currentArg?.cursor !== previousArg?.cursor
            },
        }),
    }),
})

// Export hooks
export const {
    useRegisterMutation,
    useLoginMutation,
    useGetMeQuery,

    useGetDocumentsQuery,
    useGetDocumentQuery,
    useUploadDocumentMutation,
    useDeleteDocumentMutation,

    useGetChatMessagesQuery,
} = apiSlice