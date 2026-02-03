import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: true,
    },
    status: {
        type: String,
        enum: ["trialing", "active", "past_due", "canceled", "incomplete"],
        required: true,
    },
    start_at: { type: Number },
    current_period_start: { type: Number },
    current_period_end: { type: Number },
    cancel_at: { type: Number },
    provider: { type: String, default: "stripe" },
    provider_customer_id: { type: String },
    provider_subscription_id: { type: String },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
});

export default mongoose.model("Subscription", SubscriptionSchema);
