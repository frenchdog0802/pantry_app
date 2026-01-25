import mongoose from "mongoose";

const PlanEntitlementSchema = new mongoose.Schema({
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: true,
    },
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    notes: { type: String },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
});

export default mongoose.model("PlanEntitlement", PlanEntitlementSchema);
