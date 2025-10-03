import Folder from "../models/folder.model.js";

// Get all folders
export const getAllFolders = async (req, res) => {
    try {
        const folders = await Folder.find();
        res.json(folders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single folder by ID
export const getFolderById = async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) return res.status(404).json({ message: 'Folder not found' });
        res.json(folder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new folder
export const createFolder = async (req, res) => {
    const folder = new Folder(req.body);
    try {
        const newFolder = await folder.save();
        res.status(201).json(newFolder);
    } catch (err) {
        res.status(400).json({ message: err.message });
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
        if (!updatedFolder) return res.status(404).json({ message: 'Folder not found' });
        res.json(updatedFolder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a folder
export const deleteFolder = async (req, res) => {
    try {
        const deletedFolder = await Folder.findByIdAndDelete(req.params.id);
        if (!deletedFolder) return res.status(404).json({ message: 'Folder not found' });
        res.json({ message: 'Folder deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder
};
