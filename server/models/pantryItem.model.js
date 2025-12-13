import mongoose from "mongoose";

const PantryItemSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        ingredient_id: { type: String, ref: 'Ingredient', required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: false },
        notes: { type: String },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);

PantryItemSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

PantryItemSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});


const PantryItem = mongoose.model("PantryItem", PantryItemSchema);
export default PantryItem;
