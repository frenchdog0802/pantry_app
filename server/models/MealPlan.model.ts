import mongoose from "mongoose";

export interface MealPlan extends mongoose.Document {
    user_id: string;
    recipe_id: number;
    meal_type?: string;
    serving_date?: string; // could be 'YYYY-MM-DD' or ISO date
    createdAt: number;
    updatedAt: number;
}

const MealPlanSchema = new mongoose.Schema<MealPlan>(
    {
        user_id: { type: String, required: true },
        recipe_id: { type: Number, required: true },
        meal_type: { type: String },
        serving_date: { type: String },
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

MealPlanSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export default mongoose.model<MealPlan>("MealPlan", MealPlanSchema);
