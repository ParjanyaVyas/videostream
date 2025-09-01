import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import videoReducer from './features/videoSlice';
import commentReducer from './features/commentSlice';
import likeReducer from './features/likeSlice';
import playlistReducer from './features/playlistSlice';
import subscriptionReducer from './features/subscriptionSlice';
import tweetReducer from './features/tweetSlice';
import dashboardReducer from './features/dashboardSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        video: videoReducer,
        comment: commentReducer,
        like: likeReducer,
        playlist: playlistReducer,
        subscription: subscriptionReducer,
        tweet: tweetReducer,
        dashboard: dashboardReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;