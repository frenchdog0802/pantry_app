import mongoose from "mongoose";

export interface RecipeIngredient extends mongoose.Document {
    recipe_id: number;
    ingredient_id: number;
    quantity: number;
    unit?: string;
    note?: string;
    display_order?: number;
    createdAt: number;
    updatedAt: number;
}

const RecipeIngredientSchema = new mongoose.Schema<RecipeIngredient>(
    {
        recipe_id: { type: Number, required: true },
        ingredient_id: { type: Number, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String },
        note: { type: String },
        display_order: { type: Number },
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

// To prevent duplicate entries for the same (recipe_id, ingredient_id)
RecipeIngredientSchema.index({ recipe_id: 1, ingredient_id: 1 }, { unique: true });

RecipeIngredientSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export default mongoose.model<RecipeIngredient>("RecipeIngredient", RecipeIngredientSchema);
