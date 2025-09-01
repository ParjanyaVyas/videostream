import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Playlist } from "../models/playlist.model.js"
import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    // Build filters
    const pipeline = [];

    // Match only published videos unless userId is provided
    const matchStage = {
        isPublished: true
    };

    if (query) {
        matchStage.title = { $regex: query, $options: "i" };
    }

    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    pipeline.push({ $match: matchStage });

    // Lookup owner details
    pipeline.push({
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
    });

    // Unwind owner array to object
    pipeline.push({
        $addFields: {
            owner: { $first: "$owner" }
        }
    });

    // Sort
    const sortOrder = sortType === "asc" ? 1 : -1;
    pipeline.push({ $sort: { [sortBy]: sortOrder } });

    // Get total count before pagination
    const totalVideos = await Video.aggregate([...pipeline, { $count: "total" }]);
    const total = totalVideos.length > 0 ? totalVideos[0].total : 0;

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: parseInt(limit) });

    const videos = await Video.aggregate(pipeline);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        }, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    // Check if files are uploaded
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    // Upload to cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(500, "Video file upload failed");
    }

    if (!thumbnail) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    // Create video
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user._id,
        duration: videoFile.duration || 0
    });

    // Get the created video with populated owner
    const createdVideo = await Video.findById(video._id).populate("owner", "username fullName avatar");

    if (!createdVideo) {
        throw new ApiError(500, "Video creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdVideo, "Video published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const isAuthenticated = !!req.user;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Fetch video with owner details
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
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
    ]);

    if (!video || video.length === 0) {
        throw new ApiError(404, "Video not found");
    }

    // For guest users, add a check or limitation
    if (!isAuthenticated) {
        // Option 1: Add a flag that this is preview mode
        video[0].isPreviewMode = true;

        // Option 2: Limit video duration for guests
        // You could return a different videoFile URL for guests
        // that points to a shorter preview version
    }

    // Only increment view count and add to history for authenticated users
    if (isAuthenticated) {
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchHistory: videoId } }
        );
    }

    return res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!title && !description && !req.file) {
        throw new ApiError(400, "At least one field is required to update");
    }

    // Find video and check ownership
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this video");
    }

    // Update fields
    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    // Update thumbnail if provided
    if (req.file) {
        const thumbnailLocalPath = req.file.path;
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!thumbnail) {
            throw new ApiError(500, "Thumbnail upload failed");
        }

        updateFields.thumbnail = thumbnail.url;
    }

    // Update the video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        { new: true }
    ).populate("owner", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find video and check ownership
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this video");
    }

    // Delete the video
    await Video.findByIdAndDelete(videoId);

    // Also delete all comments and likes associated with the video
    // This would be better handled with a cascade delete middleware or trigger
    await Comment.deleteMany({ video: videoId });
    await Like.deleteMany({ video: videoId });

    // Remove from playlists (optional)
    await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find video and check ownership
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this video");
    }

    // Toggle publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            `Video ${updatedVideo.isPublished ? "published" : "unpublished"} successfully`
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}