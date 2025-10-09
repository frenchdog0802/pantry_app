import mongoose from "mongoose";

const MealPlanSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        recipe_id: { type: Number, required: true },
        meal_type: { type: String },
        serving_date: { type: String }, // e.g. 'YYYY-MM-DD' or ISO date
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);

MealPlanSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

MealPlanSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});


const MealPlan = mongoose.model("MealPlan", MealPlanSchema);
export default MealPlan;
