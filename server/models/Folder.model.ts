import mongoose from "mongoose";

export interface Folder extends mongoose.Document {
    name: string;
    color?: string;
    icon?: string | null;
    createdAt: number;
    updatedAt: number;
}

const FolderSchema = new mongoose.Schema<Folder>(
    {
        // id: Handled in toJSON transform from _id
        // user_id: { type: String, required: true }, // Uncomment for multi-user support
        name: { type: String, required: true },
        color: { type: String },
        icon: { type: String, default: null },
    },
    {
        timestamps: {
            currentTime: () => Math.floor(Date.now() / 1000),
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },
        versionKey: false, // Exclude __v from output
    }
);

FolderSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export default mongoose.model<Folder>("Folder", FolderSchema);