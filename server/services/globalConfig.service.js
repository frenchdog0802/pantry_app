let config = await GlobalConfigModel.findOne();
if (!config) {
    config = new GlobalConfigModel({
        appName: "My Recipe App",
        defaultLocale: "en-US",
        defaultTimeZone: "UTC",
        defaultMeasurementSystem: "metric",
        maintenanceMode: "off",
    });
    await config.save();
}