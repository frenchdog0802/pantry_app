import mongoose from "mongoose";

const GlobalConfigSchema = new mongoose.Schema(
    {
        appName: { type: String, required: true },
        defaultLocale: { type: String, required: true, default: "en-US" },
        defaultTimeZone: { type: String, required: true, default: "UTC" },
        defaultMeasurementSystem: {
            type: String,
            required: true,
            enum: ["metric", "imperial"],
            default: "metric",
        },
        maintenanceMode: { type: String, enum: ["on", "off"], default: "off" },
        createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
        updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    },
    {
        versionKey: false,
    }
);

GlobalConfigSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

GlobalConfigSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});

const GlobalConfig = mongoose.model("GlobalConfig", GlobalConfigSchema);
export default GlobalConfig;
