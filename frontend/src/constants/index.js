// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/users/register',
        LOGIN: '/users/login',
        LOGOUT: '/users/logout',
        REFRESH_TOKEN: '/users/refresh-token',
        CURRENT_USER: '/users/current-user',
        CHANGE_PASSWORD: '/users/change-password',
        UPDATE_ACCOUNT: '/users/update-account',
        UPDATE_AVATAR: '/users/update-avatar',
        UPDATE_COVER_IMAGE: '/users/cover-image',
        CHANNEL_PROFILE: '/users/c',
        WATCH_HISTORY: '/users/history',
    },
    VIDEOS: {
        BASE: '/videos',
        TOGGLE_PUBLISH: '/videos/toggle/publish',
    },
    COMMENTS: {
        BASE: '/comments',
    },
    LIKES: {
        VIDEO: '/likes/toggle/v',
        COMMENT: '/likes/toggle/c',
        TWEET: '/likes/toggle/t',
        LIKED_VIDEOS: '/likes/videos',
    },
    PLAYLISTS: {
        BASE: '/playlist',
        USER: '/playlist/user',
        ADD_VIDEO: '/playlist/add',
        REMOVE_VIDEO: '/playlist/remove',
    },
    SUBSCRIPTIONS: {
        CHANNELS: '/subscriptions/c',
        SUBSCRIBERS: '/subscriptions/u',
    },
    TWEETS: {
        BASE: '/tweets',
        USER: '/tweets/user',
    },
    DASHBOARD: {
        STATS: '/dashboard/stats',
        VIDEOS: '/dashboard/videos',
    },
};

// File upload constraints
export const FILE_CONSTRAINTS = {
    VIDEO: {
        MAX_SIZE_MB: 100, // 100MB
        ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
        ALLOWED_EXTENSIONS: ['.mp4', '.webm', '.ogg'],
    },
    IMAGE: {
        MAX_SIZE_MB: 5, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
    },
    THUMBNAIL: {
        MAX_SIZE_MB: 2, // 2MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
        RECOMMENDED_DIMENSIONS: {
            WIDTH: 1280,
            HEIGHT: 720,
        },
    },
    AVATAR: {
        MAX_SIZE_MB: 1, // 1MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
        RECOMMENDED_DIMENSIONS: {
            WIDTH: 400,
            HEIGHT: 400,
        },
    },
    COVER_IMAGE: {
        MAX_SIZE_MB: 3, // 3MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
        RECOMMENDED_DIMENSIONS: {
            WIDTH: 1200,
            HEIGHT: 300,
        },
    },
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    VIDEOS_PER_PAGE: 12,
    COMMENTS_PER_PAGE: 20,
    PLAYLISTS_PER_PAGE: 8,
    TWEETS_PER_PAGE: 15,
    MAX_LIMIT: 50,
};

// Sort options
export const SORT_OPTIONS = {
    VIDEOS: {
        NEWEST: { sortBy: 'createdAt', sortType: 'desc' },
        OLDEST: { sortBy: 'createdAt', sortType: 'asc' },
        MOST_VIEWED: { sortBy: 'views', sortType: 'desc' },
        LEAST_VIEWED: { sortBy: 'views', sortType: 'asc' },
        ALPHABETICAL: { sortBy: 'title', sortType: 'asc' },
        DURATION_LONG: { sortBy: 'duration', sortType: 'desc' },
        DURATION_SHORT: { sortBy: 'duration', sortType: 'asc' },
    },
    COMMENTS: {
        NEWEST: { sortBy: 'createdAt', sortType: 'desc' },
        OLDEST: { sortBy: 'createdAt', sortType: 'asc' },
    },
    PLAYLISTS: {
        NEWEST: { sortBy: 'createdAt', sortType: 'desc' },
        OLDEST: { sortBy: 'createdAt', sortType: 'asc' },
        ALPHABETICAL: { sortBy: 'name', sortType: 'asc' },
    },
};

// Form validation rules
export const VALIDATION_RULES = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        PATTERN: /^[a-zA-Z0-9_]+$/,
        ERROR_MESSAGES: {
            REQUIRED: 'Username is required',
            MIN_LENGTH: 'Username must be at least 3 characters',
            MAX_LENGTH: 'Username must be less than 20 characters',
            PATTERN: 'Username can only contain letters, numbers, and underscores',
        },
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        ERROR_MESSAGES: {
            REQUIRED: 'Email is required',
            PATTERN: 'Please enter a valid email address',
        },
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        MAX_LENGTH: 50,
        ERROR_MESSAGES: {
            REQUIRED: 'Password is required',
            MIN_LENGTH: 'Password must be at least 6 characters',
            MAX_LENGTH: 'Password must be less than 50 characters',
        },
    },
    FULL_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50,
        ERROR_MESSAGES: {
            REQUIRED: 'Full name is required',
            MIN_LENGTH: 'Full name must be at least 2 characters',
            MAX_LENGTH: 'Full name must be less than 50 characters',
        },
    },
    VIDEO_TITLE: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 100,
        ERROR_MESSAGES: {
            REQUIRED: 'Video title is required',
            MIN_LENGTH: 'Title must be at least 3 characters',
            MAX_LENGTH: 'Title must be less than 100 characters',
        },
    },
    VIDEO_DESCRIPTION: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
        ERROR_MESSAGES: {
            REQUIRED: 'Video description is required',
            MIN_LENGTH: 'Description must be at least 10 characters',
            MAX_LENGTH: 'Description must be less than 1000 characters',
        },
    },
    COMMENT_CONTENT: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 500,
        ERROR_MESSAGES: {
            REQUIRED: 'Comment cannot be empty',
            MAX_LENGTH: 'Comment must be less than 500 characters',
        },
    },
    TWEET_CONTENT: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 280,
        ERROR_MESSAGES: {
            REQUIRED: 'Tweet cannot be empty',
            MAX_LENGTH: 'Tweet must be less than 280 characters',
        },
    },
    PLAYLIST_NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        ERROR_MESSAGES: {
            REQUIRED: 'Playlist name is required',
            MIN_LENGTH: 'Playlist name must be at least 3 characters',
            MAX_LENGTH: 'Playlist name must be less than 50 characters',
        },
    },
    PLAYLIST_DESCRIPTION: {
        MAX_LENGTH: 200,
        ERROR_MESSAGES: {
            MAX_LENGTH: 'Description must be less than 200 characters',
        },
    },
};

// Local storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    LOGIN_REQUIRED: 'Please log in to continue.',
};

export default {
    API_ENDPOINTS,
    FILE_CONSTRAINTS,
    PAGINATION,
    VALIDATION_RULES,
    STORAGE_KEYS,
    ERROR_MESSAGES,
};
