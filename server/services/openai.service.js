import OpenAI from "openai";
import config from "../config/config.js";


const openai = new OpenAI({
    apiKey: config.openAIApiKey
});

export async function askCookingAI(messages) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 500,
        messages
    });

    return response.choices[0].message.content;
}
