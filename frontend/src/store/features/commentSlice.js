import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for comment operations
export const getVideoComments = createAsyncThunk(
    'comment/getVideoComments',
    async ({ videoId, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/comments/${videoId}?page=${page}&limit=${limit}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch comments'
            );
        }
    }
);

export const addComment = createAsyncThunk(
    'comment/addComment',
    async ({ videoId, content }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/comments/${videoId}`, { content });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to add comment'
            );
        }
    }
);

export const updateComment = createAsyncThunk(
    'comment/updateComment',
    async ({ commentId, content }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/comments/c/${commentId}`, { content });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update comment'
            );
        }
    }
);

export const deleteComment = createAsyncThunk(
    'comment/deleteComment',
    async (commentId, { rejectWithValue }) => {
        try {
            await api.delete(`/comments/c/${commentId}`);
            return commentId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete comment'
            );
        }
    }
);

const initialState = {
    comments: [],
    totalComments: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    isLoading: false,
    error: null,
    addLoading: false,
    updateLoading: false,
    deleteLoading: false,
};

const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearComments: (state) => {
            state.comments = [];
            state.totalComments = 0;
            state.totalPages = 0;
            state.currentPage = 1;
            state.hasNextPage = false;
            state.hasPrevPage = false;
        },
        updateCommentInList: (state, action) => {
            const index = state.comments.findIndex(comment => comment._id === action.payload._id);
            if (index !== -1) {
                state.comments[index] = action.payload;
            }
        },
        removeCommentFromList: (state, action) => {
            state.comments = state.comments.filter(comment => comment._id !== action.payload);
            state.totalComments = Math.max(0, state.totalComments - 1);
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Video Comments
            .addCase(getVideoComments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getVideoComments.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.docs) {
                    // Paginated response
                    state.comments = action.payload.docs;
                    state.totalComments = action.payload.totalDocs;
                    state.totalPages = action.payload.totalPages;
                    state.currentPage = action.payload.page;
                    state.hasNextPage = action.payload.hasNextPage;
                    state.hasPrevPage = action.payload.hasPrevPage;
                } else {
                    // Simple array response
                    state.comments = action.payload;
                    state.totalComments = action.payload.length;
                }
            })
            .addCase(getVideoComments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Add Comment
            .addCase(addComment.pending, (state) => {
                state.addLoading = true;
                state.error = null;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.addLoading = false;
                state.comments.unshift(action.payload);
                state.totalComments += 1;
            })
            .addCase(addComment.rejected, (state, action) => {
                state.addLoading = false;
                state.error = action.payload;
            })

            // Update Comment
            .addCase(updateComment.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.comments.findIndex(comment => comment._id === action.payload._id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Delete Comment
            .addCase(deleteComment.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.comments = state.comments.filter(comment => comment._id !== action.payload);
                state.totalComments = Math.max(0, state.totalComments - 1);
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearComments,
    updateCommentInList,
    removeCommentFromList
} = commentSlice.actions;

export default commentSlice.reducer;
