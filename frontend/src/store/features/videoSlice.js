import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for video operations
export const getAllVideos = createAsyncThunk(
    'video/getAllVideos',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.query) queryParams.append('query', params.query);
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortType) queryParams.append('sortType', params.sortType);
            if (params.userId) queryParams.append('userId', params.userId);

            const response = await api.get(`/videos?${queryParams.toString()}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch videos'
            );
        }
    }
);

export const getVideoById = createAsyncThunk(
    'video/getVideoById',
    async (videoId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/videos/${videoId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch video'
            );
        }
    }
);

export const publishVideo = createAsyncThunk(
    'video/publishVideo',
    async (videoData, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('title', videoData.title);
            formData.append('description', videoData.description);
            formData.append('videoFile', videoData.videoFile);
            formData.append('thumbnail', videoData.thumbnail);

            const response = await api.post('/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to publish video'
            );
        }
    }
);

export const updateVideo = createAsyncThunk(
    'video/updateVideo',
    async ({ videoId, updateData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();

            if (updateData.title) formData.append('title', updateData.title);
            if (updateData.description) formData.append('description', updateData.description);
            if (updateData.thumbnail) formData.append('thumbnail', updateData.thumbnail);

            const response = await api.patch(`/videos/${videoId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update video'
            );
        }
    }
);

export const deleteVideo = createAsyncThunk(
    'video/deleteVideo',
    async (videoId, { rejectWithValue }) => {
        try {
            await api.delete(`/videos/${videoId}`);
            return videoId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete video'
            );
        }
    }
);

export const togglePublishStatus = createAsyncThunk(
    'video/togglePublishStatus',
    async (videoId, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/videos/toggle/publish/${videoId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle publish status'
            );
        }
    }
);

const initialState = {
    videos: [],
    currentVideo: null,
    totalVideos: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    isLoading: false,
    error: null,
    publishLoading: false,
    updateLoading: false,
    deleteLoading: false,
};

const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentVideo: (state) => {
            state.currentVideo = null;
        },
        clearVideos: (state) => {
            state.videos = [];
            state.totalVideos = 0;
            state.totalPages = 0;
            state.currentPage = 1;
            state.hasNextPage = false;
            state.hasPrevPage = false;
        },
        updateVideoInList: (state, action) => {
            const index = state.videos.findIndex(video => video._id === action.payload._id);
            if (index !== -1) {
                state.videos[index] = action.payload;
            }
        },
        removeVideoFromList: (state, action) => {
            state.videos = state.videos.filter(video => video._id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // Get All Videos
            .addCase(getAllVideos.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllVideos.fulfilled, (state, action) => {
                state.isLoading = false;
                state.videos = action.payload.docs || action.payload;
                state.totalVideos = action.payload.totalDocs || action.payload.length;
                state.totalPages = action.payload.totalPages || 1;
                state.currentPage = action.payload.page || 1;
                state.hasNextPage = action.payload.hasNextPage || false;
                state.hasPrevPage = action.payload.hasPrevPage || false;
            })
            .addCase(getAllVideos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Video By ID
            .addCase(getVideoById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getVideoById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentVideo = action.payload;
            })
            .addCase(getVideoById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Publish Video
            .addCase(publishVideo.pending, (state) => {
                state.publishLoading = true;
                state.error = null;
            })
            .addCase(publishVideo.fulfilled, (state, action) => {
                state.publishLoading = false;
                state.videos.unshift(action.payload);
            })
            .addCase(publishVideo.rejected, (state, action) => {
                state.publishLoading = false;
                state.error = action.payload;
            })

            // Update Video
            .addCase(updateVideo.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateVideo.fulfilled, (state, action) => {
                state.updateLoading = false;

                // Update in videos list
                const index = state.videos.findIndex(video => video._id === action.payload._id);
                if (index !== -1) {
                    state.videos[index] = action.payload;
                }

                // Update current video if it's the same
                if (state.currentVideo && state.currentVideo._id === action.payload._id) {
                    state.currentVideo = action.payload;
                }
            })
            .addCase(updateVideo.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Delete Video
            .addCase(deleteVideo.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteVideo.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.videos = state.videos.filter(video => video._id !== action.payload);

                // Clear current video if it was deleted
                if (state.currentVideo && state.currentVideo._id === action.payload) {
                    state.currentVideo = null;
                }
            })
            .addCase(deleteVideo.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            })

            // Toggle Publish Status
            .addCase(togglePublishStatus.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(togglePublishStatus.fulfilled, (state, action) => {
                state.updateLoading = false;

                // Update in videos list
                const index = state.videos.findIndex(video => video._id === action.payload._id);
                if (index !== -1) {
                    state.videos[index] = action.payload;
                }

                // Update current video if it's the same
                if (state.currentVideo && state.currentVideo._id === action.payload._id) {
                    state.currentVideo = action.payload;
                }
            })
            .addCase(togglePublishStatus.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearCurrentVideo,
    clearVideos,
    updateVideoInList,
    removeVideoFromList
} = videoSlice.actions;

export default videoSlice.reducer;
