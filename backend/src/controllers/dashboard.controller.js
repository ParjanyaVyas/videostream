import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // Get channel statistics for the authenticated user

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: 1 } // We need to calculate this from likes collection
            }
        }
    ]);

    // Get total likes on user's videos
    const likeStats = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $match: {
                "videoDetails.owner": new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: 1 }
            }
        }
    ]);

    // Get total subscribers
    const subscriberStats = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: { $sum: 1 }
            }
        }
    ]);

    // Get recent subscribers
    const recentSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: { $first: "$subscriber" }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $limit: 10
        }
    ]);

    // Prepare stats object
    const stats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: likeStats[0]?.totalLikes || 0,
        totalSubscribers: subscriberStats[0]?.totalSubscribers || 0,
        recentSubscribers: recentSubscribers || []
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    // Get all videos uploaded by the authenticated user
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" }
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                likesCount: 1,
                commentsCount: 1
            }
        },
        {
            $sort: { [sortBy]: sortType === "asc" ? 1 : -1 }
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    // Count total videos for pagination
    const totalVideos = await Video.countDocuments({ owner: req.user._id });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                meta: {
                    total: totalVideos,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(totalVideos / parseInt(limit))
                }
            },
            "Channel videos fetched successfully"
        )
    );
});


export {
    getChannelStats,
    getChannelVideos
}