import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema(
    {
        // user_id: { type: String, required: true }, // Uncomment for multi-user support
        name: { type: String, required: true },
        color: { type: String },
        icon: { type: String, default: null },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false, // exclude __v
    }
);

FolderSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

FolderSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});


const Folder = mongoose.model("Folder", FolderSchema);
export default Folder;
