import JobSkills from "../models/jobSkills.model.js";  // Assuming you have a Contact model

// Create a new job skill
export const create = async (req, res) => {
    try {
        const jobSkill = new JobSkills(req.body);
        await jobSkill.save();
        res.status(201).json(jobSkill);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// List all job skills
export const list = async (req, res) => {
    try {
        const jobSkills = await JobSkills.find();
        res.status(200).json(jobSkills);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a specific job skill by ID
export const read = async (req, res) => {
    try {
        res.status(200).json(req.jobSkill);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a job skill by ID
export const update = async (req, res) => {
    try {
        const jobSkill = await JobSkills.findByIdAndUpdate(req.jobSkill._id, req.body, { new: true });
        res.status(200).json(jobSkill);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a job skill by ID
export const remove = async (req, res) => {
    try {
        await req.jobSkill.deleteOne();
        res.status(200).json({ message: "Job skill deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Retrieve job skill by ID and assign to req.jobSkill
export const jobSkillByID = async (req, res, next, id) => {
    try {
        const jobSkill = await JobSkills.findById(id);
        if (!jobSkill) {
            return res.status(404).json({ error: "Job skill not found" });
        }
        req.jobSkill = jobSkill;
        next();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const removeAll = async (req, res) => {
    try {
        await JobSkills.deleteMany();
        res.status(200).json({ message: "All job skills removed successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default { create, list, read, update, remove, jobSkillByID, removeAll };
