import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    // Create tweet
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    // Get the created tweet with populated owner
    const createdTweet = await Tweet.findById(tweet._id).populate(
        "owner",
        "username fullName avatar"
    );

    if (!createdTweet) {
        throw new ApiError(500, "Tweet creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdTweet, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get user tweets with pagination
    const tweets = await Tweet.find({ owner: userId })
        .populate("owner", "username fullName avatar")
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

    // Count total tweets for pagination
    const totalTweets = await Tweet.countDocuments({ owner: userId });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                meta: {
                    total: totalTweets,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(totalTweets / parseInt(limit))
                }
            },
            "User tweets fetched successfully"
        )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    // Find tweet and check ownership
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this tweet");
    }

    // Update tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    ).populate("owner", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Find tweet and check ownership
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this tweet");
    }

    // Delete tweet
    await Tweet.findByIdAndDelete(tweetId);

    // Delete associated likes
    await Like.deleteMany({ tweet: tweetId });

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}