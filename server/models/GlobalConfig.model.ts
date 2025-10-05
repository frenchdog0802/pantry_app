import mongoose from "mongoose";

// ====================
// GLOBAL CONFIG SCHEMA
// ====================
export interface GlobalConfig extends mongoose.Document {
    id: string; // Transformed from _id
    appName: string;
    defaultLocale: string;
    defaultTimeZone: string;
    defaultMeasurementSystem: string;
    createAt: number;
    updateAt: number;
    maintenanceMode: string; // e.g., "on" or "off"
}

const GlobalConfigSchema = new mongoose.Schema<GlobalConfig>(
    {
        appName: { type: String, required: true },
        defaultLocale: { type: String, required: true, default: "en-US" }, // e.g., "en-US"
        defaultTimeZone: { type: String, required: true, default: "UTC" }, // e.g., "America/New_York"
        defaultMeasurementSystem: { type: String, required: true, enum: ["metric", "imperial"], default: "metric" },
        maintenanceMode: { type: String, enum: ["on", "off"], default: "off" },
    },
    {
        timestamps: {
            currentTime: () => Math.floor(Date.now() / 1000),
            createdAt: "createAt",
            updatedAt: "updateAt",
        },
        versionKey: false,
    }
);

GlobalConfigSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret._id;
    },
});

export const GlobalConfigModel = mongoose.model<GlobalConfig>("GlobalConfig", GlobalConfigSchema);