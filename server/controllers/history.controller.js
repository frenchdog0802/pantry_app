import History from "../models/jobSkills.model.js";  // Assuming you have a Contact model

// Get all history records
export const getAllHistory = async (req, res) => {
    try {
        // const history = await History.find();
        // mock data for demonstration
        //         type CookingHistoryItem = {
        //     id: string;
        //     date: string;
        //     recipeId: Recipe['id'];
        //     recipeName: string;
        //     type?: string;
        //     image?: string | null;
        // };
        const history = [
            { id: 1, date: '2023-01-01', recipeId: '1', recipeName: 'Recipe 1', type: 'breakfast', image: null },
            { id: 2, date: '2023-01-02', recipeId: '2', recipeName: 'Recipe 2', type: 'lunch', image: null }
        ];
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// // Get a single history record by ID
// exports.getHistoryById = async (req, res) => {
//     try {
//         const history = await History.findById(req.params.id);
//         if (!history) return res.status(404).json({ message: 'History not found' });
//         res.json(history);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// // Create a new history record
// exports.createHistory = async (req, res) => {
//     const history = new History(req.body);
//     try {
//         const newHistory = await history.save();
//         res.status(201).json(newHistory);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };

// // Update a history record
// exports.updateHistory = async (req, res) => {
//     try {
//         const updatedHistory = await History.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );
//         if (!updatedHistory) return res.status(404).json({ message: 'History not found' });
//         res.json(updatedHistory);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };

// // Delete a history record
// exports.deleteHistory = async (req, res) => {
//     try {
//         const deletedHistory = await History.findByIdAndDelete(req.params.id);
//         if (!deletedHistory) return res.status(404).json({ message: 'History not found' });
//         res.json({ message: 'History deleted' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

export default { getAllHistory };