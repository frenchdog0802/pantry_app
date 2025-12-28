import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        default_unit: { type: String },
        image_url: { type: String },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);

IngredientSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});


IngredientSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});

const Ingredient = mongoose.models.Ingredient || mongoose.model("Ingredient", IngredientSchema);
export default Ingredient;
