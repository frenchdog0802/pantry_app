import express from "express";
import { askCookingAI } from "../services/openai.service.js";
import { SYSTEM_PROMPT } from "../helpers/systemPrompt.js";
import { quotaLimiter } from "../middleware/quota.js";
import { promptGuard } from "../middleware/promptGuard.js";
import auth from "../services/auth.service.js";
import chatActionService from "../services/chatAction.service.js";

const router = express.Router();

/**
 * POST /api/chat/send
 * Main chat endpoint with action execution support
 */
router.post("/send", auth.requireSignin, quotaLimiter, promptGuard, async (req, res) => {
    try {
        const userMessage = req.body.message;
        const userId = req.auth.user_id;

        // Build context with user's recipe context if provided
        let contextMessage = userMessage;
        if (req.body.recipeContext) {
            contextMessage = `[Context: User is viewing recipe with ID: ${req.body.recipeContext.recipeId}, name: "${req.body.recipeContext.recipeName}"]\n\n${userMessage}`;
        }

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: contextMessage }
        ];

        const aiResponse = await askCookingAI(messages);
        let parsedResponse;

        try {
            parsedResponse = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error("Failed to parse AI response:", aiResponse);
            return res.status(500).json({
                type: "error",
                message: "AI returned invalid response format"
            });
        }

        // If AI detected an action, execute it
        if (parsedResponse.type === "action" && parsedResponse.data?.action) {
            const actionName = parsedResponse.data.action;
            const actionParams = parsedResponse.data.params || {};

            // Inject recipeId from context if action needs it but wasn't provided
            if (actionName === 'add_recipe_to_menu' && !actionParams.recipeId && req.body.recipeContext?.recipeId) {
                actionParams.recipeId = req.body.recipeContext.recipeId;
            }

            const actionResult = await chatActionService.executeAction(actionName, actionParams, userId);

            if (actionResult.success) {
                return res.json({
                    type: "action_result",
                    message: parsedResponse.message || actionResult.data?.message || "Action completed successfully",
                    data: actionResult.data
                });
            } else {
                return res.json({
                    type: "action_error",
                    message: actionResult.error || "Action failed",
                    data: {}
                });
            }
        }

        // Regular response (not an action)
        res.json(parsedResponse);
    } catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({
            type: "error",
            message: "AI error"
        });
    }
});

/**
 * GET /api/chat/actions
 * List available chat actions (for documentation/debugging)
 */
router.get("/actions", auth.requireSignin, (req, res) => {
    res.json({
        actions: chatActionService.getAvailableActions(),
        description: "Available actions that can be triggered via chat"
    });
});

export default router;

