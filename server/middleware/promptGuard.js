const forbiddenPatterns = [
    "ignore previous",
    "system prompt",
    "act as",
    "jailbreak",
    "developer message",
    "openai policy"
];

export function promptGuard(req, res, next) {
    const input = req.body.message.toLowerCase();

    for (const keyword of forbiddenPatterns) {
        if (input.includes(keyword)) {
            return res.json({
                type: "refusal",
                message: "I can only help with cooking 😊"
            });
        }
    }

    next();
}
