import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        folder_id: { type: String },
        meal_name: { type: String, required: true },
        description: { type: String },
        steps: [{ type: String }], // can later be changed to ObjectId refs
        image_url: { type: String },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);

RecipeSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

RecipeSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});

const Recipe = mongoose.model("Recipe", RecipeSchema);
export default Recipe;
