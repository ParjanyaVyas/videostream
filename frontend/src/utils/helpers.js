// Essential utility functions for video streaming platform

/**
 * Format duration in human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format view count in human readable format
 * @param {number} count - View count
 * @returns {string} - Formatted view count
 */
export const formatViewCount = (count) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
    if (count < 1000000000) return (count / 1000000).toFixed(1) + 'M';
    return (count / 1000000000).toFixed(1) + 'B';
};

/**
 * Format date in relative time
 * @param {string} dateString - Date string
 * @returns {string} - Relative time
 */
export const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count > 0) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
};

/**
 * Validate file type for uploads
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Whether file type is valid
 */
export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {boolean} - Whether file size is valid
 */
export const validateFileSize = (file, maxSizeInMB) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function to limit API calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Check if user is owner of content
 * @param {Object} user - Current user
 * @param {Object} content - Content object with owner field
 * @returns {boolean} - Whether user is owner
 */
export const isOwner = (user, content) => {
    if (!user || !content) return false;
    const ownerId = content.owner?._id || content.owner;
    return user._id === ownerId;
};

/**
 * Extract error message from error object
 * @param {Error} error - Error object
 * @returns {string} - Error message
 */
export const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
};

/**
 * Image compression utility for video streaming platform
 * Maintains proper aspect ratios for different image types
 * @param {File} file - Image file to compress
 * @param {string} type - 'thumbnail', 'avatar', 'cover'
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, type = 'thumbnail', quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            let targetWidth, targetHeight;

            // Define dimensions based on image type
            switch (type) {
                case 'thumbnail':
                    // Video thumbnails: 16:9 aspect ratio
                    targetWidth = 1280;
                    targetHeight = 720;
                    break;
                case 'avatar':
                    // User avatars: Square aspect ratio
                    targetWidth = 400;
                    targetHeight = 400;
                    break;
                case 'cover':
                    // Cover images: Banner format
                    targetWidth = 1920;
                    targetHeight = 1080;
                    break;
                default:
                    // Default to thumbnail
                    targetWidth = 1280;
                    targetHeight = 720;
            }

            // Calculate dimensions maintaining aspect ratio
            const aspectRatio = img.width / img.height;
            const targetAspectRatio = targetWidth / targetHeight;

            if (type === 'avatar') {
                // For avatars, crop to square
                const size = Math.min(img.width, img.height);
                const x = (img.width - size) / 2;
                const y = (img.height - size) / 2;

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                ctx.drawImage(img, x, y, size, size, 0, 0, targetWidth, targetHeight);
            } else {
                // For thumbnails and covers, maintain aspect ratio
                if (aspectRatio > targetAspectRatio) {
                    // Image is wider than target
                    targetHeight = targetWidth / aspectRatio;
                } else {
                    // Image is taller than target
                    targetWidth = targetHeight * aspectRatio;
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            }

            canvas.toBlob(resolve, 'image/jpeg', quality);
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
