import api from './axiosConfig';

// Auth API functions
export const authAPI = {
    register: (userData) => {
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

        return api.post('/users/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    login: (loginData) => api.post('/users/login', loginData),

    logout: () => api.post('/users/logout'),

    refreshToken: (refreshToken) => api.post('/users/refresh-token', { refreshToken }),

    getCurrentUser: () => api.get('/users/current-user'),

    changePassword: (passwordData) => api.post('/users/change-password', passwordData),

    updateAccount: (updateData) => api.patch('/users/update-account', updateData),

    updateAvatar: (avatarFile) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        return api.patch('/users/update-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateCoverImage: (coverImageFile) => {
        const formData = new FormData();
        formData.append('coverImage', coverImageFile);
        return api.patch('/users/cover-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    getChannelProfile: (username) => api.get(`/users/c/${username}`),

    getWatchHistory: () => api.get('/users/history'),
};

// Video API functions
export const videoAPI = {
    getAllVideos: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) queryParams.append(key, params[key]);
        });
        return api.get(`/videos?${queryParams.toString()}`);
    },

    getVideoById: (videoId) => api.get(`/videos/${videoId}`),

    publishVideo: (videoData) => {
        const formData = new FormData();
        formData.append('title', videoData.title);
        formData.append('description', videoData.description);
        formData.append('videoFile', videoData.videoFile);
        formData.append('thumbnail', videoData.thumbnail);

        return api.post('/videos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateVideo: (videoId, updateData) => {
        const formData = new FormData();
        Object.keys(updateData).forEach(key => {
            if (updateData[key]) formData.append(key, updateData[key]);
        });

        return api.patch(`/videos/${videoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),

    togglePublishStatus: (videoId) => api.patch(`/videos/toggle/publish/${videoId}`),
};

// Comment API functions
export const commentAPI = {
    getVideoComments: (videoId, params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) queryParams.append(key, params[key]);
        });
        return api.get(`/comments/${videoId}?${queryParams.toString()}`);
    },

    addComment: (videoId, content) => api.post(`/comments/${videoId}`, { content }),

    updateComment: (commentId, content) => api.patch(`/comments/c/${commentId}`, { content }),

    deleteComment: (commentId) => api.delete(`/comments/c/${commentId}`),
};

// Like API functions
export const likeAPI = {
    toggleVideoLike: (videoId) => api.post(`/likes/toggle/v/${videoId}`),

    toggleCommentLike: (commentId) => api.post(`/likes/toggle/c/${commentId}`),

    toggleTweetLike: (tweetId) => api.post(`/likes/toggle/t/${tweetId}`),

    getLikedVideos: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) queryParams.append(key, params[key]);
        });
        return api.get(`/likes/videos?${queryParams.toString()}`);
    },
};

// Playlist API functions
export const playlistAPI = {
    createPlaylist: (playlistData) => api.post('/playlist', playlistData),

    getPlaylistById: (playlistId) => api.get(`/playlist/${playlistId}`),

    getUserPlaylists: (userId) => api.get(`/playlist/user/${userId}`),

    updatePlaylist: (playlistId, updateData) => api.patch(`/playlist/${playlistId}`, updateData),

    deletePlaylist: (playlistId) => api.delete(`/playlist/${playlistId}`),

    addVideoToPlaylist: (videoId, playlistId) => api.patch(`/playlist/add/${videoId}/${playlistId}`),

    removeVideoFromPlaylist: (videoId, playlistId) => api.patch(`/playlist/remove/${videoId}/${playlistId}`),
};

// Subscription API functions
export const subscriptionAPI = {
    toggleSubscription: (channelId) => api.post(`/subscriptions/c/${channelId}`),

    getSubscribedChannels: (subscriberId) => api.get(`/subscriptions/u/${subscriberId}`),

    getUserChannelSubscribers: (channelId) => api.get(`/subscriptions/c/${channelId}`),
};

// Tweet API functions
export const tweetAPI = {
    createTweet: (tweetData) => api.post('/tweets', tweetData),

    getUserTweets: (userId, params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) queryParams.append(key, params[key]);
        });
        return api.get(`/tweets/user/${userId}?${queryParams.toString()}`);
    },

    updateTweet: (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content }),

    deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`),
};

// Dashboard API functions
export const dashboardAPI = {
    getChannelStats: () => api.get('/dashboard/stats'),

    getChannelVideos: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) queryParams.append(key, params[key]);
        });
        return api.get(`/dashboard/videos?${queryParams.toString()}`);
    },
};

// Export all APIs as a single object for convenience
export const API = {
    auth: authAPI,
    video: videoAPI,
    comment: commentAPI,
    like: likeAPI,
    playlist: playlistAPI,
    subscription: subscriptionAPI,
    tweet: tweetAPI,
    dashboard: dashboardAPI,
};
