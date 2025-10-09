import mongoose from "mongoose";

const StepSchema = new mongoose.Schema(
    {
        recipe_id: { type: Number, required: true },
        step_no: { type: Number, required: true },
        instruction: { type: String, required: true },
        image_url: { type: String },
        timer_second: { type: String },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false, // exclude __v
    }
);

StepSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

StepSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});


const Step = mongoose.model("Step", StepSchema);
export default Step;
