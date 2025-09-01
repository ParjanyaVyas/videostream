import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }

    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required");
    }

    // Create playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    });

    // Get the created playlist
    const createdPlaylist = await Playlist.findById(playlist._id);

    if (!createdPlaylist) {
        throw new ApiError(500, "Playlist creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get user playlists
    const playlists = await Playlist.find({ owner: userId })
        .populate("videos", "title thumbnail duration views")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Get playlist with videos
    const playlist = await Playlist.findById(playlistId)
        .populate({
            path: "videos",
            select: "title thumbnail duration views owner createdAt",
            populate: {
                path: "owner",
                select: "username fullName avatar"
            }
        })
        .populate("owner", "username fullName avatar");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if playlist exists and user is owner
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to modify this playlist");
    }

    // Check if video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }

    // Add video to playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId }
        },
        { new: true }
    ).populate("videos", "title thumbnail duration views");

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if playlist exists and user is owner
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to modify this playlist");
    }

    // Check if video is in playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not in playlist");
    }

    // Remove video from playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    ).populate("videos", "title thumbnail duration views");

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Check if playlist exists and user is owner
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this playlist");
    }

    // Delete playlist
    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if (!name && !description) {
        throw new ApiError(400, "At least one field is required to update");
    }

    // Check if playlist exists and user is owner
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this playlist");
    }

    // Update fields
    const updateFields = {};

    if (name && name.trim() !== "") updateFields.name = name;
    if (description && description.trim() !== "") updateFields.description = description;

    // Update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updateFields
        },
        { new: true }
    ).populate("videos", "title thumbnail duration views");

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}