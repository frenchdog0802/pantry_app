import mongoose from "mongoose";

const UsageQuotaSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    window: { type: String, default: "monthly" }, // monthly, daily
    period_start: { type: Number },
    period_end: { type: Number },
    recipes_created: { type: Number, default: 0 },
    ai_message_sent: { type: Number, default: 0 },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
});

export default mongoose.model("UsageQuota", UsageQuotaSchema);
