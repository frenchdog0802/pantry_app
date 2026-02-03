import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        required: true,
    },
    amount_cents: { type: Number, required: true },
    status: { type: String, required: true }, // succeeded, pending, failed
    paid_at: { type: Number },
    provider_payment_id: { type: String },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
});

export default mongoose.model("Payment", PaymentSchema);
