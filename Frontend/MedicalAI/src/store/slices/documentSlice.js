import { createSlice } from "@reduxjs/toolkit";

const documentSlice = createSlice({
    name: 'document',

    initialState: {
        selected: null,
        isUploading: false,
        uploadProgress: 0,
    },

    reducers: {
        setSelected: (state, { payload }) => {
            state.selected = payload;
        },

        setUploading: (state, { payload }) => {
            state.isUploading = !!payload; // ensure boolean
        },

        setUploadProgress: (state, { payload }) => {
            state.uploadProgress = Math.max(0, Math.min(100, Number(payload) || 0));
        },

        clearUpload: (state) => {
            state.isUploading = false;
            state.uploadProgress = 0;
        },

        // Optional: Reset entire upload state
        resetDocument: (state) => {
            state.selected = null;
            state.isUploading = false;
            state.uploadProgress = 0;
        },
    },
});

// Export actions
export const {
    setSelected,
    setUploading,
    setUploadProgress,     
    clearUpload,
    resetDocument,
} = documentSlice.actions;

// Export reducer
export default documentSlice.reducer;

// Selectors
export const selectSelected = (state) => state.document.selected;
export const selectIsUploading = (state) => state.document.isUploading;
export const selectUploadProgress = (state) => state.document.uploadProgress;