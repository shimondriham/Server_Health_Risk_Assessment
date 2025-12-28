const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});




async function askAi(userMessage) {
    try {
        if (!userMessage) {
            return res
                .status(400)
                .json({ message: "userMessage is required." });
        }
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    // We need to build a template for the AI 
                    content: "template...",
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        });
        const results = response.choices[0].message.content.trim();
        console.log("results:", results);
        return results;
    } catch (error) {
        console.error("Data processing error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function askAiForAnalysis(questionsAndAnswers) {
    try {
        if (!questionsAndAnswers || questionsAndAnswers.length === 0) {
            return res
                .status(400)
                .json({ message: "No valid information was received." });
        }
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    // We need to build a template for the AI 
                    content: "template...",
                },
                {
                    role: "user",
                    content: `Here is the array of questions and answers: ${JSON.stringify(
                        questionsAndAnswers
                    )
                        }`,
                },
            ],
        });
        const results = response.choices[0].message.content.trim();
        console.log("results:", results);
        return results;
    } catch (error) {
        console.error("Data processing error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { askAiForAnalysis, askAi };