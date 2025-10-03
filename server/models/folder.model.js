import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema({
    id: { type: String },
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: false },
    icon: { type: String, default: null },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) }
}, {
    timestamps: {
        currentTime: () => Math.floor(Date.now() / 1000),
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});

FolderSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    }
});

export default mongoose.model('Folder', FolderSchema);