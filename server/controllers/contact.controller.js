import Contact from "../models/contact.model.js";  // Assuming you have a Contact model

// Create a new contact
export const create = async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();
        res.status(201).json(contact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// List all contacts
export const list = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a specific contact by ID
export const read = async (req, res) => {
    try {
        res.status(200).json(req.contact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a contact by ID
export const update = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.contact._id, req.body, { new: true });
        res.status(200).json(contact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a contact by ID
export const remove = async (req, res) => {
    try {
        await req.contact.deleteOne();
        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Retrieve contact by ID and assign to req.contact
export const contactByID = async (req, res, next, id) => {
    try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }
        req.contact = contact;
        next();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const removeAll = async (req, res) => {
    try {
        await Contact.deleteMany();
        res.status(200).json({ message: "All contacts removed successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default { create, list, read, update, remove, contactByID, removeAll };
