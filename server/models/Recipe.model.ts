import mongoose from "mongoose";

export interface Recipe extends mongoose.Document {
    user_id: string;
    folder_id?: string;
    title: string;
    description?: string;
    steps?: string[]; // or array of ObjectIds if referencing Step collection
    image_url?: string;
    createdAt: number;
    updatedAt: number;
}

const RecipeSchema = new mongoose.Schema<Recipe>(
    {
        user_id: { type: String, required: true },
        folder_id: { type: String },
        title: { type: String, required: true },
        description: { type: String },
        steps: [{ type: String }], // you can later change this to ObjectId refs
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

RecipeSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export default mongoose.model<Recipe>("Recipe", RecipeSchema);
