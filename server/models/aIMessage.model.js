import mongoose from "mongoose";

/**
 * @typedef {Object} AIMessage
 * @property {string} user_id
 * @property {"user"|"assistant"|"system"} role
 * @property {string} content
 * @property {number} [token_in]
 * @property {number} [token_out]
 * @property {number} createdAt
 */
const AIMessageSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        role: { type: String, enum: ["user", "assistant", "system"], required: true },
        content: { type: String, required: true },
        token_in: { type: Number },
        token_out: { type: Number },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);


AIMessageSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

AIMessageSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});
export default mongoose.model("AIMessage", AIMessageSchema);
