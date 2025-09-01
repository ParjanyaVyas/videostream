import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for playlist operations
export const createPlaylist = createAsyncThunk(
    'playlist/createPlaylist',
    async (playlistData, { rejectWithValue }) => {
        try {
            const response = await api.post('/playlist', playlistData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create playlist'
            );
        }
    }
);

export const getPlaylistById = createAsyncThunk(
    'playlist/getPlaylistById',
    async (playlistId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/playlist/${playlistId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch playlist'
            );
        }
    }
);

export const getUserPlaylists = createAsyncThunk(
    'playlist/getUserPlaylists',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/playlist/user/${userId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user playlists'
            );
        }
    }
);

export const updatePlaylist = createAsyncThunk(
    'playlist/updatePlaylist',
    async ({ playlistId, updateData }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/playlist/${playlistId}`, updateData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update playlist'
            );
        }
    }
);

export const deletePlaylist = createAsyncThunk(
    'playlist/deletePlaylist',
    async (playlistId, { rejectWithValue }) => {
        try {
            await api.delete(`/playlist/${playlistId}`);
            return playlistId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete playlist'
            );
        }
    }
);

export const addVideoToPlaylist = createAsyncThunk(
    'playlist/addVideoToPlaylist',
    async ({ videoId, playlistId }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
            return { videoId, playlistId, ...response.data.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to add video to playlist'
            );
        }
    }
);

export const removeVideoFromPlaylist = createAsyncThunk(
    'playlist/removeVideoFromPlaylist',
    async ({ videoId, playlistId }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
            return { videoId, playlistId, ...response.data.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to remove video from playlist'
            );
        }
    }
);

const initialState = {
    playlists: [],
    currentPlaylist: null,
    userPlaylists: [],
    isLoading: false,
    error: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    addVideoLoading: false,
    removeVideoLoading: false,
};

const playlistSlice = createSlice({
    name: 'playlist',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPlaylist: (state) => {
            state.currentPlaylist = null;
        },
        clearPlaylists: (state) => {
            state.playlists = [];
            state.userPlaylists = [];
            state.currentPlaylist = null;
        },
        updatePlaylistInList: (state, action) => {
            // Update in playlists array
            const playlistIndex = state.playlists.findIndex(playlist => playlist._id === action.payload._id);
            if (playlistIndex !== -1) {
                state.playlists[playlistIndex] = action.payload;
            }

            // Update in userPlaylists array
            const userPlaylistIndex = state.userPlaylists.findIndex(playlist => playlist._id === action.payload._id);
            if (userPlaylistIndex !== -1) {
                state.userPlaylists[userPlaylistIndex] = action.payload;
            }

            // Update current playlist if it's the same
            if (state.currentPlaylist && state.currentPlaylist._id === action.payload._id) {
                state.currentPlaylist = action.payload;
            }
        },
        removePlaylistFromList: (state, action) => {
            state.playlists = state.playlists.filter(playlist => playlist._id !== action.payload);
            state.userPlaylists = state.userPlaylists.filter(playlist => playlist._id !== action.payload);

            // Clear current playlist if it was deleted
            if (state.currentPlaylist && state.currentPlaylist._id === action.payload) {
                state.currentPlaylist = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Playlist
            .addCase(createPlaylist.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(createPlaylist.fulfilled, (state, action) => {
                state.createLoading = false;
                state.playlists.unshift(action.payload);
                state.userPlaylists.unshift(action.payload);
            })
            .addCase(createPlaylist.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // Get Playlist By ID
            .addCase(getPlaylistById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getPlaylistById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPlaylist = action.payload;
            })
            .addCase(getPlaylistById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get User Playlists
            .addCase(getUserPlaylists.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserPlaylists.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userPlaylists = action.payload;
            })
            .addCase(getUserPlaylists.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Playlist
            .addCase(updatePlaylist.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updatePlaylist.fulfilled, (state, action) => {
                state.updateLoading = false;

                // Update in playlists array
                const playlistIndex = state.playlists.findIndex(playlist => playlist._id === action.payload._id);
                if (playlistIndex !== -1) {
                    state.playlists[playlistIndex] = action.payload;
                }

                // Update in userPlaylists array
                const userPlaylistIndex = state.userPlaylists.findIndex(playlist => playlist._id === action.payload._id);
                if (userPlaylistIndex !== -1) {
                    state.userPlaylists[userPlaylistIndex] = action.payload;
                }

                // Update current playlist if it's the same
                if (state.currentPlaylist && state.currentPlaylist._id === action.payload._id) {
                    state.currentPlaylist = action.payload;
                }
            })
            .addCase(updatePlaylist.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Delete Playlist
            .addCase(deletePlaylist.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deletePlaylist.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.playlists = state.playlists.filter(playlist => playlist._id !== action.payload);
                state.userPlaylists = state.userPlaylists.filter(playlist => playlist._id !== action.payload);

                // Clear current playlist if it was deleted
                if (state.currentPlaylist && state.currentPlaylist._id === action.payload) {
                    state.currentPlaylist = null;
                }
            })
            .addCase(deletePlaylist.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            })

            // Add Video to Playlist
            .addCase(addVideoToPlaylist.pending, (state) => {
                state.addVideoLoading = true;
                state.error = null;
            })
            .addCase(addVideoToPlaylist.fulfilled, (state, action) => {
                state.addVideoLoading = false;
                // You might want to update the playlist to reflect the new video
                // This depends on what your backend returns
            })
            .addCase(addVideoToPlaylist.rejected, (state, action) => {
                state.addVideoLoading = false;
                state.error = action.payload;
            })

            // Remove Video from Playlist
            .addCase(removeVideoFromPlaylist.pending, (state) => {
                state.removeVideoLoading = true;
                state.error = null;
            })
            .addCase(removeVideoFromPlaylist.fulfilled, (state, action) => {
                state.removeVideoLoading = false;
                // You might want to update the playlist to reflect the video removal
                // This depends on what your backend returns
            })
            .addCase(removeVideoFromPlaylist.rejected, (state, action) => {
                state.removeVideoLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearCurrentPlaylist,
    clearPlaylists,
    updatePlaylistInList,
    removePlaylistFromList
} = playlistSlice.actions;

export default playlistSlice.reducer;
