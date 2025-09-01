import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for like operations
export const toggleVideoLike = createAsyncThunk(
    'like/toggleVideoLike',
    async (videoId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/likes/toggle/v/${videoId}`);
            return { videoId, ...response.data.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle video like'
            );
        }
    }
);

export const toggleCommentLike = createAsyncThunk(
    'like/toggleCommentLike',
    async (commentId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/likes/toggle/c/${commentId}`);
            return { commentId, ...response.data.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle comment like'
            );
        }
    }
);

export const toggleTweetLike = createAsyncThunk(
    'like/toggleTweetLike',
    async (tweetId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/likes/toggle/t/${tweetId}`);
            return { tweetId, ...response.data.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle tweet like'
            );
        }
    }
);

export const getLikedVideos = createAsyncThunk(
    'like/getLikedVideos',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const response = await api.get(`/likes/videos?${queryParams.toString()}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch liked videos'
            );
        }
    }
);

const initialState = {
    likedVideos: [],
    videoLikes: {},
    commentLikes: {},
    tweetLikes: {},
    totalLikedVideos: 0,
    totalPages: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
    toggleLoading: false,
};

const likeSlice = createSlice({
    name: 'like',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearLikedVideos: (state) => {
            state.likedVideos = [];
            state.totalLikedVideos = 0;
            state.totalPages = 0;
            state.currentPage = 1;
        },
        setVideoLikeStatus: (state, action) => {
            const { videoId, isLiked, likesCount } = action.payload;
            state.videoLikes[videoId] = { isLiked, likesCount };
        },
        setCommentLikeStatus: (state, action) => {
            const { commentId, isLiked, likesCount } = action.payload;
            state.commentLikes[commentId] = { isLiked, likesCount };
        },
        setTweetLikeStatus: (state, action) => {
            const { tweetId, isLiked, likesCount } = action.payload;
            state.tweetLikes[tweetId] = { isLiked, likesCount };
        },
        clearAllLikes: (state) => {
            state.videoLikes = {};
            state.commentLikes = {};
            state.tweetLikes = {};
            state.likedVideos = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Toggle Video Like
            .addCase(toggleVideoLike.pending, (state) => {
                state.toggleLoading = true;
                state.error = null;
            })
            .addCase(toggleVideoLike.fulfilled, (state, action) => {
                state.toggleLoading = false;
                const { videoId, isLiked, likesCount } = action.payload;
                state.videoLikes[videoId] = { isLiked, likesCount };
            })
            .addCase(toggleVideoLike.rejected, (state, action) => {
                state.toggleLoading = false;
                state.error = action.payload;
            })

            // Toggle Comment Like
            .addCase(toggleCommentLike.pending, (state) => {
                state.toggleLoading = true;
                state.error = null;
            })
            .addCase(toggleCommentLike.fulfilled, (state, action) => {
                state.toggleLoading = false;
                const { commentId, isLiked, likesCount } = action.payload;
                state.commentLikes[commentId] = { isLiked, likesCount };
            })
            .addCase(toggleCommentLike.rejected, (state, action) => {
                state.toggleLoading = false;
                state.error = action.payload;
            })

            // Toggle Tweet Like
            .addCase(toggleTweetLike.pending, (state) => {
                state.toggleLoading = true;
                state.error = null;
            })
            .addCase(toggleTweetLike.fulfilled, (state, action) => {
                state.toggleLoading = false;
                const { tweetId, isLiked, likesCount } = action.payload;
                state.tweetLikes[tweetId] = { isLiked, likesCount };
            })
            .addCase(toggleTweetLike.rejected, (state, action) => {
                state.toggleLoading = false;
                state.error = action.payload;
            })

            // Get Liked Videos
            .addCase(getLikedVideos.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getLikedVideos.fulfilled, (state, action) => {
                state.isLoading = false;

                if (action.payload.docs) {
                    // Paginated response
                    state.likedVideos = action.payload.docs;
                    state.totalLikedVideos = action.payload.totalDocs;
                    state.totalPages = action.payload.totalPages;
                    state.currentPage = action.payload.page;
                } else {
                    // Simple array response
                    state.likedVideos = action.payload;
                    state.totalLikedVideos = action.payload.length;
                }
            })
            .addCase(getLikedVideos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearLikedVideos,
    setVideoLikeStatus,
    setCommentLikeStatus,
    setTweetLikeStatus,
    clearAllLikes
} = likeSlice.actions;

export default likeSlice.reducer;
