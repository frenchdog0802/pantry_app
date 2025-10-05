import mongoose from "mongoose";

export interface Ingredient extends mongoose.Document {
    id: string;
    user_id: string;
    name: string;
    default_unit?: string;
    image_url?: string;
    createdAt: number;
    updatedAt: number;
}

const IngredientSchema = new mongoose.Schema<Ingredient>(
    {
        user_id: { type: String, required: true },
        name: { type: String, required: true },
        default_unit: { type: String },
        image_url: { type: String },
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

IngredientSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

export default mongoose.model<Ingredient>("Ingredient", IngredientSchema);
