import { createSlice, nanoid } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: 'chat',

    initialState: {
        messages: [],
        wsStatus: 'idle',     // 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
        error: null,
    },

    reducers: {
        setWsStatus: (state, { payload }) => {
            state.wsStatus = payload;
        },

        addMessage: (state, { payload }) => {
            const newMessage = {
                id: payload.id || nanoid(),
                role: payload.role,
                content: payload.content,
                timestamp: payload.timestamp || new Date().toISOString(),
                ...payload, // allow additional fields if needed
            };
            state.messages.push(newMessage);
        },

        setMessages: (state, { payload }) => {
            state.messages = payload.map((m) => ({
                id: m.id || nanoid(),
                role: m.role,
                content: m.content,
                timestamp: m.created_at || m.timestamp || new Date().toISOString(),
            }));
        },

        prependMessages: (state, { payload }) => {
            const incoming = payload.map((m) => ({
                id: m.id || nanoid(),
                role: m.role,
                content: m.content,
                timestamp: m.created_at || m.timestamp || new Date().toISOString(),
            }));

            state.messages = [...incoming, ...state.messages];
        },

        clearChat: (state) => {
            state.messages = [];
            state.wsStatus = 'idle';
            state.error = null;
        },

        setError: (state, { payload }) => {
            state.error = payload;
        },

        // Optional but useful
        removeMessage: (state, { payload: messageId }) => {
            state.messages = state.messages.filter((msg) => msg.id !== messageId);
        },
    },
});

// Export actions
export const {
    setWsStatus,
    addMessage,
    setMessages,
    prependMessages,
    clearChat,
    setError,
    removeMessage,
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;

// Selectors
export const selectMessages = (state) => state.chat.messages;
export const selectWsStatus = (state) => state.chat.wsStatus;
export const selectChatError = (state) => state.chat.error;