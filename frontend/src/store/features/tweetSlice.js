import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for tweet operations
export const createTweet = createAsyncThunk(
    'tweet/createTweet',
    async (tweetData, { rejectWithValue }) => {
        try {
            const response = await api.post('/tweets', tweetData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create tweet'
            );
        }
    }
);

export const getUserTweets = createAsyncThunk(
    'tweet/getUserTweets',
    async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/tweets/user/${userId}?page=${page}&limit=${limit}`);
            return { ...response.data.data, userId }; // Include userId in response
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user tweets'
            );
        }
    }
);

export const updateTweet = createAsyncThunk(
    'tweet/updateTweet',
    async ({ tweetId, content }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tweets/${tweetId}`, { content });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update tweet'
            );
        }
    }
);

export const deleteTweet = createAsyncThunk(
    'tweet/deleteTweet',
    async (tweetId, { rejectWithValue }) => {
        try {
            await api.delete(`/tweets/${tweetId}`);
            return tweetId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete tweet'
            );
        }
    }
);

const initialState = {
    userTweets: {},
    isLoading: false,
    error: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
};

const tweetSlice = createSlice({
    name: 'tweet',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearTweets: (state) => {
            state.userTweets = {};
        },
        clearUserTweets: (state, action) => {
            const userId = action.payload;
            if (state.userTweets[userId]) {
                delete state.userTweets[userId];
            }
        },
        updateTweetInList: (state, action) => {
            const updatedTweet = action.payload;

            // Update in user tweets
            Object.keys(state.userTweets).forEach(userId => {
                if (state.userTweets[userId]?.tweets) {
                    const userTweetIndex = state.userTweets[userId].tweets.findIndex(tweet => tweet._id === updatedTweet._id);
                    if (userTweetIndex !== -1) {
                        state.userTweets[userId].tweets[userTweetIndex] = updatedTweet;
                    }
                }
            });
        },
        removeTweetFromList: (state, action) => {
            const tweetId = action.payload;

            // Remove from user tweets
            Object.keys(state.userTweets).forEach(userId => {
                if (state.userTweets[userId]?.tweets) {
                    state.userTweets[userId].tweets = state.userTweets[userId].tweets.filter(tweet => tweet._id !== tweetId);
                }
            });
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Tweet
            .addCase(createTweet.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(createTweet.fulfilled, (state, action) => {
                state.createLoading = false;
                const newTweet = action.payload;

                // Add to user tweets if user's tweets are loaded
                const userId = newTweet.owner?._id || newTweet.owner;
                if (userId && state.userTweets[userId]?.tweets) {
                    state.userTweets[userId].tweets.unshift(newTweet);
                }
            })
            .addCase(createTweet.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // Get User Tweets
            .addCase(getUserTweets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserTweets.fulfilled, (state, action) => {
                state.isLoading = false;
                const { userId, tweets, meta } = action.payload;

                // Store tweets and metadata for the user
                state.userTweets[userId] = {
                    tweets: tweets || [],
                    meta: meta || {}
                };
            })
            .addCase(getUserTweets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Tweet
            .addCase(updateTweet.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateTweet.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedTweet = action.payload;

                // Update in user tweets
                Object.keys(state.userTweets).forEach(userId => {
                    if (state.userTweets[userId]?.tweets) {
                        const userTweetIndex = state.userTweets[userId].tweets.findIndex(tweet => tweet._id === updatedTweet._id);
                        if (userTweetIndex !== -1) {
                            state.userTweets[userId].tweets[userTweetIndex] = updatedTweet;
                        }
                    }
                });
            })
            .addCase(updateTweet.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Delete Tweet
            .addCase(deleteTweet.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteTweet.fulfilled, (state, action) => {
                state.deleteLoading = false;
                const tweetId = action.payload;

                // Remove from user tweets
                Object.keys(state.userTweets).forEach(userId => {
                    if (state.userTweets[userId]?.tweets) {
                        state.userTweets[userId].tweets = state.userTweets[userId].tweets.filter(tweet => tweet._id !== tweetId);
                    }
                });
            })
            .addCase(deleteTweet.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearTweets,
    clearUserTweets,
    updateTweetInList,
    removeTweetFromList
} = tweetSlice.actions;

export default tweetSlice.reducer;
