import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Async thunks for subscription operations
export const toggleSubscription = createAsyncThunk(
    'subscription/toggleSubscription',
    async (channelId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/subscriptions/c/${channelId}`);
            return { channelId, ...response.data.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle subscription'
            );
        }
    }
);

export const getSubscribedChannels = createAsyncThunk(
    'subscription/getSubscribedChannels',
    async (subscriberId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/subscriptions/u/${subscriberId}`);
            return response.data.data; // Returns { channels: [...], meta: {...} }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch subscribed channels'
            );
        }
    }
);

export const getUserChannelSubscribers = createAsyncThunk(
    'subscription/getUserChannelSubscribers',
    async (channelId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/subscriptions/c/${channelId}`);
            return response.data.data; // Returns { subscribers: [...], meta: {...} }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch channel subscribers'
            );
        }
    }
);

const initialState = {
    subscribedChannels: [],
    channelSubscribers: [],
    subscriptionStatus: {}, // Store subscription status by channelId
    totalSubscribedChannels: 0,
    totalSubscribers: 0,
    isLoading: false,
    error: null,
    toggleLoading: false,
};

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSubscriptions: (state) => {
            state.subscribedChannels = [];
            state.channelSubscribers = [];
            state.subscriptionStatus = {};
            state.totalSubscribedChannels = 0;
            state.totalSubscribers = 0;
        },
        setSubscriptionStatus: (state, action) => {
            const { channelId, isSubscribed, subscribersCount } = action.payload;
            state.subscriptionStatus[channelId] = { isSubscribed, subscribersCount };
        },
        updateChannelSubscriptionStatus: (state, action) => {
            const { channelId, isSubscribed, subscribersCount } = action.payload;

            // Update subscription status
            state.subscriptionStatus[channelId] = { isSubscribed, subscribersCount };

            if (isSubscribed) {
                // Add to subscribed channels if not already present
                const existingChannel = state.subscribedChannels.find(channel => channel._id === channelId);
                if (!existingChannel) {
                    // You would need the channel data to add it properly
                    // This might come from the toggle response or you might need to fetch it
                }
            } else {
                // Remove from subscribed channels
                state.subscribedChannels = state.subscribedChannels.filter(channel => channel._id !== channelId);
                state.totalSubscribedChannels = Math.max(0, state.totalSubscribedChannels - 1);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Toggle Subscription
            .addCase(toggleSubscription.pending, (state) => {
                state.toggleLoading = true;
                state.error = null;
            })
            .addCase(toggleSubscription.fulfilled, (state, action) => {
                state.toggleLoading = false;
                const { channelId, isSubscribed, subscribersCount } = action.payload;

                // Update subscription status
                state.subscriptionStatus[channelId] = { isSubscribed, subscribersCount };

                if (isSubscribed) {
                    // If subscribed and channel data is available, add to subscribed channels
                    if (action.payload.channel) {
                        const existingIndex = state.subscribedChannels.findIndex(channel => channel._id === channelId);
                        if (existingIndex === -1) {
                            state.subscribedChannels.push(action.payload.channel);
                            state.totalSubscribedChannels += 1;
                        }
                    }
                } else {
                    // Remove from subscribed channels
                    state.subscribedChannels = state.subscribedChannels.filter(channel => channel._id !== channelId);
                    state.totalSubscribedChannels = Math.max(0, state.totalSubscribedChannels - 1);
                }
            })
            .addCase(toggleSubscription.rejected, (state, action) => {
                state.toggleLoading = false;
                state.error = action.payload;
            })

            // Get Subscribed Channels
            .addCase(getSubscribedChannels.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSubscribedChannels.fulfilled, (state, action) => {
                state.isLoading = false;
                const { channels, meta } = action.payload;

                state.subscribedChannels = channels || [];
                state.totalSubscribedChannels = meta?.total || 0;

                // Update subscription status for all channels
                state.subscribedChannels.forEach(subscription => {
                    if (subscription.channel) {
                        state.subscriptionStatus[subscription.channel._id] = {
                            isSubscribed: true,
                            subscribersCount: 0 // Backend doesn't provide this in the response
                        };
                    }
                });
            })
            .addCase(getSubscribedChannels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Channel Subscribers
            .addCase(getUserChannelSubscribers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserChannelSubscribers.fulfilled, (state, action) => {
                state.isLoading = false;
                const { subscribers, meta } = action.payload;

                state.channelSubscribers = subscribers || [];
                state.totalSubscribers = meta?.total || 0;
            })
            .addCase(getUserChannelSubscribers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearSubscriptions,
    setSubscriptionStatus,
    updateChannelSubscriptionStatus
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;