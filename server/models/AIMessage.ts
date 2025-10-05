import mongoose from "mongoose";

export interface AIMessage extends mongoose.Document {
    user_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    token_in?: number;
    token_out?: number;
    createdAt: number;
}

const AIMessageSchema = new mongoose.Schema<AIMessage>(
    {
        user_id: { type: String, required: true },
        role: { type: String, enum: ["user", "assistant", "system"], required: true },
        content: { type: String, required: true },
        token_in: { type: Number },
        token_out: { type: Number },
    },
    {
        timestamps: {
            currentTime: () => Math.floor(Date.now() / 1000),
            createdAt: "createdAt",
            updatedAt: false, // messages are immutable after creation
        },
        versionKey: false,
    }
);

AIMessageSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export default mongoose.model<AIMessage>("AIMessage", AIMessageSchema);
