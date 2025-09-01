import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

// Utility
export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);

// Auth Selectors
export const useAuth = () => useAppSelector((state) => state.auth);
export const useAuthUser = () => useAppSelector((state) => state.auth.user);
export const useAuthLoading = () => useAppSelector((state) => state.auth.isLoading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);

// Video Selectors
export const useVideo = () => useAppSelector((state) => state.video);
export const useVideos = () => useAppSelector((state) => state.video.videos);
export const useCurrentVideo = () => useAppSelector((state) => state.video.currentVideo);
export const useVideoLoading = () => useAppSelector((state) => state.video.isLoading);
export const useVideoError = () => useAppSelector((state) => state.video.error);

// Comment Selectors
export const useComment = () => useAppSelector((state) => state.comment);
export const useComments = () => useAppSelector((state) => state.comment.comments);
export const useCommentLoading = () => useAppSelector((state) => state.comment.isLoading);
export const useCommentError = () => useAppSelector((state) => state.comment.error);

// Like Selectors
export const useLike = () => useAppSelector((state) => state.like);
export const useLikedVideos = () => useAppSelector((state) => state.like.likedVideos);
export const useVideoLikes = () => useAppSelector((state) => state.like.videoLikes);
export const useCommentLikes = () => useAppSelector((state) => state.like.commentLikes);
export const useTweetLikes = () => useAppSelector((state) => state.like.tweetLikes);
export const useLikeLoading = () => useAppSelector((state) => state.like.isLoading);

// Playlist Selectors
export const usePlaylist = () => useAppSelector((state) => state.playlist);
export const usePlaylists = () => useAppSelector((state) => state.playlist.playlists);
export const useUserPlaylists = () => useAppSelector((state) => state.playlist.userPlaylists);
export const useCurrentPlaylist = () => useAppSelector((state) => state.playlist.currentPlaylist);
export const usePlaylistLoading = () => useAppSelector((state) => state.playlist.isLoading);

// Subscription Selectors
export const useSubscription = () => useAppSelector((state) => state.subscription);
export const useSubscribedChannels = () => useAppSelector((state) => state.subscription.subscribedChannels);
export const useChannelSubscribers = () => useAppSelector((state) => state.subscription.channelSubscribers);
export const useSubscriptionStatus = () => useAppSelector((state) => state.subscription.subscriptionStatus);
export const useSubscriptionLoading = () => useAppSelector((state) => state.subscription.isLoading);

// Tweet Selectors
export const useTweet = () => useAppSelector((state) => state.tweet);
export const useUserTweets = () => useAppSelector((state) => state.tweet.userTweets);
export const useTweetLoading = () => useAppSelector((state) => state.tweet.isLoading);

// Dashboard Selectors
export const useDashboard = () => useAppSelector((state) => state.dashboard);
export const useChannelStats = () => useAppSelector((state) => state.dashboard.stats);
export const useChannelVideos = () => useAppSelector((state) => state.dashboard.channelVideos);
export const useDashboardLoading = () => useAppSelector((state) => state.dashboard.isLoading);

// Default constants (avoid new objects/arrays)
const DEFAULT_LIKE = { isLiked: false, likesCount: 0 };
const DEFAULT_SUBSCRIPTION = { isSubscribed: false, subscribersCount: 0 };
const EMPTY_ARRAY = [];

// Video like status
const makeSelectVideoLikeStatus = (videoId) =>
    createSelector(
        (state) => state.like.videoLikes[videoId],
        (likeData) => likeData || DEFAULT_LIKE
    );
export const useVideoLikeStatus = (videoId) =>
    useAppSelector(makeSelectVideoLikeStatus(videoId));

// Comment like status
const makeSelectCommentLikeStatus = (commentId) =>
    createSelector(
        (state) => state.like.commentLikes[commentId],
        (likeData) => likeData || DEFAULT_LIKE
    );
export const useCommentLikeStatus = (commentId) =>
    useAppSelector(makeSelectCommentLikeStatus(commentId));

// Tweet like status
const makeSelectTweetLikeStatus = (tweetId) =>
    createSelector(
        (state) => state.like.tweetLikes[tweetId],
        (likeData) => likeData || DEFAULT_LIKE
    );
export const useTweetLikeStatus = (tweetId) =>
    useAppSelector(makeSelectTweetLikeStatus(tweetId));

// Channel subscription status
const makeSelectChannelSubscriptionStatus = (channelId) =>
    createSelector(
        (state) => state.subscription.subscriptionStatus[channelId],
        (subData) => subData || DEFAULT_SUBSCRIPTION
    );
export const useChannelSubscriptionStatus = (channelId) =>
    useAppSelector(makeSelectChannelSubscriptionStatus(channelId));

// Tweets by userId
const makeSelectUserTweetsByUserId = (userId) =>
    createSelector(
        (state) => state.tweet.userTweets[userId],
        (userTweetData) => userTweetData?.tweets || EMPTY_ARRAY
    );
export const useUserTweetsByUserId = (userId) =>
    useAppSelector(makeSelectUserTweetsByUserId(userId));
