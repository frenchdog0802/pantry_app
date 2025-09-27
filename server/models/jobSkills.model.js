import mongoose from "mongoose";
const JobSkillSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true }
});
export default mongoose.model('JobSkill', JobSkillSchema);