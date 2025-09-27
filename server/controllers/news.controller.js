import News from "../models/news.model.js";  // Assuming you have a news model

// Create a new news
export const create = async (req, res) => {
    try {
        const news = new News(req.body);
        // Set the date to current time Unix timestamp
        news.date = Date.now();
        await news.save();
        res.status(201).json(news);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// List all news
export const list = async (req, res) => {
    try {
        const news = await News.find();
        res.status(200).json(news);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a specific news by ID
export const read = async (req, res) => {
    try {
        res.status(200).json(req.news);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a news by ID
export const update = async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(req.news._id, req.body, { new: true });
        res.status(200).json(news);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a news by ID
export const remove = async (req, res) => {
    try {
        await req.news.deleteOne();
        res.status(200).json({ message: "News deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Retrieve news by ID and assign to req.news
export const newsByID = async (req, res, next, id) => {
    try {
        const news = await News.findById(id);
        if (!news) {
            return res.status(404).json({ error: "News not found" });
        }
        req.news = news;
        next();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const removeAll = async (req, res) => {
    try {
        await News.deleteMany();
        res.status(200).json({ message: "All newss removed successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default { create, list, read, update, remove, newsByID, removeAll };
