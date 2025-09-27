import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
}, { _id: false });

const RecipeSchema = new mongoose.Schema({
    id: { type: String },
    mealName: { type: String, required: true },
    mealType: { type: String, required: true },
    date: { type: String, required: true },
    ingredients: { type: [IngredientSchema], required: true },
    image: { type: String, default: null }
}, { timestamps: true });

RecipeSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    }
});

export default mongoose.model('Recipe', RecipeSchema);