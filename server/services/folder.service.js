import Folder from "../models/folder.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Get all folders
export const getAllFolders = async (req, res) => {
    try {
        const userId = req.auth.user_id;
        const folders = await Folder.find({ user_id: userId });
        res.json(successResponse(folders));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Get a single folder by ID
export const getFolderById = async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) return res.json({ message: 'Folder not found' });
        res.json(successResponse(folder));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Create a new folder
export const createFolder = async (req, res) => {
    const folder = new Folder({
        user_id: req.auth.user_id,
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon
    });
    try {
        const newFolder = await folder.save();
        res.json(successResponse(newFolder));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Update a folder
export const updateFolder = async (req, res) => {
    try {
        const updatedFolder = await Folder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedFolder) return res.json(errorResponse({ message: 'Folder not found' }));
        res.json(successResponse(updatedFolder));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

// Delete a folder
export const deleteFolder = async (req, res) => {
    try {
        const deletedFolder = await Folder.findByIdAndDelete(req.params.id);
        if (!deletedFolder) return res.json(errorResponse({ message: 'Folder not found' }));
        res.json(successResponse({ message: 'Folder deleted' }));
    } catch (err) {
        res.json(errorResponse({ message: err.message }));
    }
};

export default {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder
};
