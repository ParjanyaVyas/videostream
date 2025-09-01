import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for API calls
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('fullName', userData.fullName);
            formData.append('password', userData.password);

            if (userData.avatar) {
                formData.append('avatar', userData.avatar);
            }
            if (userData.coverImage) {
                formData.append('coverImage', userData.coverImage);
            }

            const response = await api.post('/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Registration failed'
            );
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await api.post('/users/login', loginData);
            const { accessToken, refreshToken, user } = response.data.data;

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            return { user, accessToken, refreshToken };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/users/logout');

            // Clear tokens from localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            return true;
        } catch (error) {
            // Clear tokens even if logout fails
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            return rejectWithValue(
                error.response?.data?.message || 'Logout failed'
            );
        }
    }
);

export const refreshAccessToken = createAsyncThunk(
    'auth/refreshAccessToken',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await api.post('/users/refresh-token', { refreshToken });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            return rejectWithValue(
                error.response?.data?.message || 'Token refresh failed'
            );
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/current-user');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to get current user'
            );
        }
    }
);

export const changeCurrentPassword = createAsyncThunk(
    'auth/changeCurrentPassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await api.post('/users/change-password', passwordData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Password change failed'
            );
        }
    }
);

export const updateAccountDetails = createAsyncThunk(
    'auth/updateAccountDetails',
    async (updateData, { rejectWithValue }) => {
        try {
            const response = await api.patch('/users/update-account', updateData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Account update failed'
            );
        }
    }
);

export const updateUserAvatar = createAsyncThunk(
    'auth/updateUserAvatar',
    async (avatarFile, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await api.patch('/users/update-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Avatar update failed'
            );
        }
    }
);

export const updateUserCoverImage = createAsyncThunk(
    'auth/updateUserCoverImage',
    async (coverImageFile, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('coverImage', coverImageFile);

            const response = await api.patch('/users/cover-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Cover image update failed'
            );
        }
    }
);

export const getUserChannelProfile = createAsyncThunk(
    'auth/getUserChannelProfile',
    async (username, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/c/${username}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to get channel profile'
            );
        }
    }
);

export const getWatchHistory = createAsyncThunk(
    'auth/getWatchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/history');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to get watch history'
            );
        }
    }
);

const initialState = {
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,
    channelProfile: null,
    watchHistory: [],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearChannelProfile: (state) => {
            state.channelProfile = null;
        },
        clearWatchHistory: (state) => {
            state.watchHistory = [];
        },
        setCredentials: (state, action) => {
            const { user, accessToken, refreshToken } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
        },
        clearCredentials: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.channelProfile = null;
            state.watchHistory = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Register User
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // Registration successful
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Login User
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })

            // Logout User
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.channelProfile = null;
                state.watchHistory = [];
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                // Still clear credentials on logout failure
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            })

            // Refresh Access Token
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(refreshAccessToken.rejected, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            })

            // Get Current User
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Change Password
            .addCase(changeCurrentPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changeCurrentPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changeCurrentPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Account Details
            .addCase(updateAccountDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAccountDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(updateAccountDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Avatar
            .addCase(updateUserAvatar.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserAvatar.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(updateUserAvatar.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Cover Image
            .addCase(updateUserCoverImage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserCoverImage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(updateUserCoverImage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Channel Profile
            .addCase(getUserChannelProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserChannelProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.channelProfile = action.payload;
            })
            .addCase(getUserChannelProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Watch History
            .addCase(getWatchHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getWatchHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.watchHistory = action.payload;
            })
            .addCase(getWatchHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearChannelProfile,
    clearWatchHistory,
    setCredentials,
    clearCredentials
} = authSlice.actions;

export default authSlice.reducer;