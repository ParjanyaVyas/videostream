import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for dashboard operations
export const getChannelStats = createAsyncThunk(
    'dashboard/getChannelStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch channel stats'
            );
        }
    }
);

export const getChannelVideos = createAsyncThunk(
    'dashboard/getChannelVideos',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortType) queryParams.append('sortType', params.sortType);

            const response = await api.get(`/dashboard/videos?${queryParams.toString()}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch channel videos'
            );
        }
    }
);

const initialState = {
    stats: {
        totalVideos: 0,
        totalViews: 0,
        totalSubscribers: 0,
        totalLikes: 0,
        totalComments: 0,
        totalWatchTime: 0,
    },
    channelVideos: [],
    totalChannelVideos: 0,
    totalPages: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
    statsLoading: false,
    videosLoading: false,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearDashboardData: (state) => {
            state.stats = {
                totalVideos: 0,
                totalViews: 0,
                totalSubscribers: 0,
                totalLikes: 0,
                totalComments: 0,
                totalWatchTime: 0,
            };
            state.channelVideos = [];
            state.totalChannelVideos = 0;
            state.totalPages = 0;
            state.currentPage = 1;
        },
        updateStatsCount: (state, action) => {
            const { type, count } = action.payload;
            if (state.stats[type] !== undefined) {
                state.stats[type] = count;
            }
        },
        incrementStatsCount: (state, action) => {
            const { type, increment = 1 } = action.payload;
            if (state.stats[type] !== undefined) {
                state.stats[type] += increment;
            }
        },
        decrementStatsCount: (state, action) => {
            const { type, decrement = 1 } = action.payload;
            if (state.stats[type] !== undefined) {
                state.stats[type] = Math.max(0, state.stats[type] - decrement);
            }
        },
        updateChannelVideoInList: (state, action) => {
            const updatedVideo = action.payload;
            const index = state.channelVideos.findIndex(video => video._id === updatedVideo._id);
            if (index !== -1) {
                state.channelVideos[index] = updatedVideo;
            }
        },
        removeChannelVideoFromList: (state, action) => {
            const videoId = action.payload;
            state.channelVideos = state.channelVideos.filter(video => video._id !== videoId);
            state.totalChannelVideos = Math.max(0, state.totalChannelVideos - 1);
            // Also update stats
            state.stats.totalVideos = Math.max(0, state.stats.totalVideos - 1);
        },
        addChannelVideoToList: (state, action) => {
            const newVideo = action.payload;
            state.channelVideos.unshift(newVideo);
            state.totalChannelVideos += 1;
            // Also update stats
            state.stats.totalVideos += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Channel Stats
            .addCase(getChannelStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
            })
            .addCase(getChannelStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.isLoading = false;

                // Handle different possible response structures
                if (action.payload) {
                    state.stats = {
                        totalVideos: action.payload.totalVideos || 0,
                        totalViews: action.payload.totalViews || 0,
                        totalSubscribers: action.payload.totalSubscribers || 0,
                        totalLikes: action.payload.totalLikes || 0,
                        totalComments: action.payload.totalComments || 0,
                        totalWatchTime: action.payload.totalWatchTime || 0,
                        ...action.payload, // Spread in case there are additional fields
                    };
                }
            })
            .addCase(getChannelStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Channel Videos
            .addCase(getChannelVideos.pending, (state) => {
                state.videosLoading = true;
                state.error = null;
            })
            .addCase(getChannelVideos.fulfilled, (state, action) => {
                state.videosLoading = false;
                state.isLoading = false;

                if (action.payload.docs) {
                    // Paginated response
                    state.channelVideos = action.payload.docs;
                    state.totalChannelVideos = action.payload.totalDocs;
                    state.totalPages = action.payload.totalPages;
                    state.currentPage = action.payload.page;
                } else {
                    // Simple array response
                    state.channelVideos = action.payload;
                    state.totalChannelVideos = action.payload.length;
                }
            })
            .addCase(getChannelVideos.rejected, (state, action) => {
                state.videosLoading = false;
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearDashboardData,
    updateStatsCount,
    incrementStatsCount,
    decrementStatsCount,
    updateChannelVideoInList,
    removeChannelVideoFromList,
    addChannelVideoToList
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
