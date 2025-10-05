import mongoose from "mongoose";

export interface Step extends mongoose.Document {
    recipe_id: number;
    step_no: number;
    instruction: string;
    image_url?: string;
    timer_second?: string;
    createdAt: number;
    updatedAt: number;
}

const StepSchema = new mongoose.Schema<Step>(
    {
        recipe_id: { type: Number, required: true },
        step_no: { type: Number, required: true },
        instruction: { type: String, required: true },
        image_url: { type: String },
        timer_second: { type: String },
    },
    {
        timestamps: {
            currentTime: () => Math.floor(Date.now() / 1000),
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },
        versionKey: false, // exclude __v
    }
);

StepSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export default mongoose.model<Step>("Step", StepSchema);
