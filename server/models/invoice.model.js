import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount_cents: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, required: true }, // draft, open, paid, uncollectible, void
    issued_at: { type: Number },
    provider_invoice_id: { type: String },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
});

export default mongoose.model("Invoice", InvoiceSchema);
