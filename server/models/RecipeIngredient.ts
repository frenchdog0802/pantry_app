import mongoose from "mongoose";

export interface RecipeIngredient extends mongoose.Document {
    recipe_id: mongoose.Types.ObjectId; // ref to Recipe
    ingredient_id: mongoose.Types.ObjectId; // ref to Ingredient
    quantity: number;
    unit?: string;
    note?: string;
    display_order?: number;
    createdAt: number;
    updatedAt: number;
}

const RecipeIngredientSchema = new mongoose.Schema<RecipeIngredient>(
    {
        recipe_id: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
        ingredient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true },
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

// Enforce uniqueness for (recipe_id + ingredient_id)
RecipeIngredientSchema.index({ recipe_id: 1, ingredient_id: 1 }, { unique: true });

// Auto-transform _id → id
RecipeIngredientSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        ret.recipe_id = ret.recipe_id?.toString();
        ret.ingredient_id = ret.ingredient_id?.toString();
        delete ret._id;
    },
});

export default mongoose.model<RecipeIngredient>("RecipeIngredient", RecipeIngredientSchema);
