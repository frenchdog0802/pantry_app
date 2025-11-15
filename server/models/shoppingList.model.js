import mongoose from "mongoose";

const ShoppingListSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        ingredient_id: { type: String, required: true },
        quantity: { type: Number },
        unit: { type: String, required: false },
        checked: { type: Boolean, default: false },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);

ShoppingListSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

ShoppingListSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});


const ShoppingList = mongoose.model("ShoppingList", ShoppingListSchema);
export default ShoppingList;
