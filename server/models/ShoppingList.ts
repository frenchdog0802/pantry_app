import mongoose from "mongoose";

export interface ShoppingList extends mongoose.Document {
    user_id: string;
    ingredient_id: string;
    quantity?: number;
    unit?: string;
    checked?: boolean;
    createdAt: number;
    updatedAt: number;
}

const ShoppingListSchema = new mongoose.Schema<ShoppingList>(
    {
        user_id: { type: String, required: true },
        ingredient_id: { type: String, required: true },
        quantity: { type: Number },
        unit: { type: String },
        checked: { type: Boolean, default: false },
    },
    {
        timestamps: {
            currentTime: () => Math.floor(Date.now() / 1000),
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },
        versionKey: false,
    }
);

ShoppingListSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export default mongoose.model<ShoppingList>("ShoppingList", ShoppingListSchema);
