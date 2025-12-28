import express from "express";
import { askCookingAI } from "../services/openai.service.js";
import { SYSTEM_PROMPT } from "../helpers/systemPrompt.js";
import { quotaLimiter } from "../middleware/quota.js";
import { promptGuard } from "../middleware/promptGuard.js";
import auth from "../services/auth.service.js";

const router = express.Router();

router.post("/send", auth.requireSignin, quotaLimiter, promptGuard, async (req, res) => {
    try {
        const userMessage = req.body.message;

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage }
        ];

        const aiResponse = await askCookingAI(messages);

        res.json(JSON.parse(aiResponse));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "AI error" });
    }
});

export default router;
