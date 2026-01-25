import mongoose from "mongoose";
import SubscriptionPlan from "../models/subscriptionPlan.model.js";
import PlanEntitlement from "../models/planEntitlement.model.js";
import Subscription from "../models/subscription.model.js";
import UsageQuota from "../models/usageQuota.model.js";
import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";
import AIMessage from "../models/aIMessage.model.js";

async function verifyModels() {
    console.log("Verifying models...");
    try {
        // Validate SubscriptionPlan
        const plan = new SubscriptionPlan({
            name: "Pro Plan",
            billing_period: "monthly",
            price_cents: 1000,
            currency: "USD",
        });
        await plan.validate();
        console.log("SubscriptionPlan valid");

        // Validate PlanEntitlement
        const entitlement = new PlanEntitlement({
            plan_id: new mongoose.Types.ObjectId(),
            key: "max_recipes",
            value: "unlimited",
        });
        await entitlement.validate();
        console.log("PlanEntitlement valid");

        // Validate Subscription
        const subscription = new Subscription({
            user_id: new mongoose.Types.ObjectId(),
            plan_id: new mongoose.Types.ObjectId(),
            status: "active",
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        });
        await subscription.validate();
        console.log("Subscription valid");

        // Validate UsageQuota
        const usage = new UsageQuota({
            user_id: new mongoose.Types.ObjectId(),
            period_start: Math.floor(Date.now() / 1000),
            period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        });
        await usage.validate();
        console.log("UsageQuota valid");

        // Validate Invoice
        const invoice = new Invoice({
            user_id: new mongoose.Types.ObjectId(),
            amount_cents: 1000,
            status: "paid",
            issued_at: Math.floor(Date.now() / 1000),
        });
        await invoice.validate();
        console.log("Invoice valid");

        // Validate Payment
        const payment = new Payment({
            invoice_id: new mongoose.Types.ObjectId(),
            amount_cents: 1000,
            status: "succeeded",
            paid_at: Math.floor(Date.now() / 1000),
        });
        await payment.validate();
        console.log("Payment valid");

        // Validate AIMessage
        const message = new AIMessage({
            user_id: new mongoose.Types.ObjectId(),
            role: "user",
            content: "Hello AI",
        });
        await message.validate();
        console.log("AIMessage valid");

        console.log("All models verified successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verifyModels();
