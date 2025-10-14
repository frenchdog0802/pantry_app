import mongoose from "mongoose";

const RecipeIngredientSchema = new mongoose.Schema(
    {
        recipe_id: { type: String, required: true },
        ingredient_id: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String },
        note: { type: String },
        // display_order: { type: Number },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);

// Prevent duplicate entries for the same (recipe_id, ingredient_id)
RecipeIngredientSchema.index({ recipe_id: 1, ingredient_id: 1 }, { unique: true });

RecipeIngredientSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

RecipeIngredientSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});


const RecipeIngredient = mongoose.model("RecipeIngredient", RecipeIngredientSchema);
export default RecipeIngredient;
