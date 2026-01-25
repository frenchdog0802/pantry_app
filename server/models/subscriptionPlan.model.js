import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    billing_period: { type: String, enum: ["monthly", "yearly"], required: true },
    price_cents: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    is_active: { type: Boolean, default: true },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
});

export default mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
