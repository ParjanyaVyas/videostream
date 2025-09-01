import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        // Unlike
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked successfully")
        );
    }

    // Like
    const newLike = await Like.create({
        video: videoId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Video liked successfully")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Check if comment exists
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        // Unlike
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Comment unliked successfully")
        );
    }

    // Like
    const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Comment liked successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check if tweet exists
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        // Unlike
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
        );
    }

    // Like
    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Tweet liked successfully")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const likes = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoDetails: { $first: "$videoDetails" }
            }
        },
        {
            $project: {
                _id: 1,
                video: 1,
                createdAt: 1,
                videoDetails: 1
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    // Count total documents for pagination
    const totalLikes = await Like.countDocuments({
        likedBy: req.user._id,
        video: { $exists: true }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                likes,
                meta: {
                    total: totalLikes,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(totalLikes / parseInt(limit))
                }
            },
            "Liked videos fetched successfully"
        )
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}