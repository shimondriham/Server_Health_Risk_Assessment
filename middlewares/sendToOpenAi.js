const { json } = require("express");
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});




async function askAi(userMessage) {
    try {
        if (!userMessage) {
            return json({ message: "userMessage is required." });
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
            return json({ message: "No valid information was received." });
        }
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Use a “convert report to dashboard JSON” prompt with a strict schema, deterministic rules, and placeholders for your UI components. Below is a copy-paste prompt you can send as the system (or first user) message, and then send the report text/PDF-extracted text as the next message.",
                },
                {
                    role: "user",
                    content: `You are Fitwave Dashboard Formatter.

Goal:
Transform a Fitwave post-assessment REPORT into a single JSON object that can be rendered 1:1 into our web dashboard.

Hard rules:
1) Output ONLY valid JSON. No markdown. No commentary. No trailing commas.
2) Use the EXACT schema provided below. Do not add keys. Do not rename keys.
3) If a field is not present in the report, set it to null and add an item to "missing_data".
4) Do not invent comparative statistics. Only output comparative metrics if they exist in the report OR if the report explicitly provides a source + value. Otherwise null.
5) Keep text short and UI-ready. Each "summary" must be <= 140 chars. Each "detail" must be <= 220 chars.
6) Every numeric value must include a unit when applicable (e.g., "m/s", "cm", "reps/30s", "deg").
7) Create a stable "severity" label for each domain: "good" | "caution" | "risk".
8) Provide a single "overall_status" with: "GREEN" | "AMBER" | "RED" and a short rationale.
9) Provide "evidence" as direct quotes or near-quotes from the report (<= 160 chars each) to support each card.
10) If the report contains standardized frameworks (PAR-Q+, ACSM, PROMIS, STEADI, etc.), list them in "frameworks_used".

Input:
You will receive the assessment report text after this message.

Output schema (must match exactly):
{
  "user": {
    "display_name": null,
    "age": null,
    "age_band": null,
    "location": null,
    "assessment_date": null
  },
  "overall": {
    "functional_capacity_label": null,
    "functional_capacity_position": null,
    "overall_status": null,
    "overall_rationale": null,
    "frameworks_used": [],
    "safety_flags": []
  },
  "cards": [
    {
      "id": "cardio_readiness",
      "title": "Cardiovascular Readiness",
      "status_label": null,
      "severity": null,
      "summary": null,
      "detail": null,
      "comparative": {
        "peer_reference": null,
        "metric_label": null,
        "value": null,
        "unit": null,
        "interpretation": null
      },
      "evidence": []
    },
    {
      "id": "functional_strength",
      "title": "Functional Strength",
      "status_label": null,
      "severity": null,
      "summary": null,
      "detail": null,
      "key_metrics": [
        { "label": null, "value": null, "unit": null, "normative_context": null }
      ],
      "comparative": {
        "peer_reference": null,
        "metric_label": null,
        "value": null,
        "unit": null,
        "interpretation": null
      },
      "evidence": []
    },
    {
      "id": "balance_fall_risk",
      "title": "Balance & Fall Risk",
      "status_label": null,
      "severity": null,
      "summary": null,
      "detail": null,
      "key_metrics": [
        { "label": null, "value": null, "unit": null, "normative_context": null }
      ],
      "risk_factors": [],
      "comparative": {
        "peer_reference": null,
        "metric_label": null,
        "value": null,
        "unit": null,
        "interpretation": null
      },
      "evidence": []
    },
    {
      "id": "mobility_pain",
      "title": "Mobility & Pain",
      "status_label": null,
      "severity": null,
      "summary": null,
      "detail": null,
      "key_metrics": [
        { "label": null, "value": null, "unit": null, "normative_context": null }
      ],
      "limitations": [],
      "comparative": {
        "peer_reference": null,
        "metric_label": null,
        "value": null,
        "unit": null,
        "interpretation": null
      },
      "evidence": []
    }
  ],
  "interpretation": {
    "positioning_statement": null,
    "distribution": {
      "peer_group": null,
      "lower_function_pct": null,
      "slightly_below_optimal_pct": null,
      "average_pct": null,
      "higher_pct": null
    }
  },
  "program_shaping": {
    "priorities": [
      {
        "id": null,
        "label": null,
        "baseline_statement": null,
        "target_statement": null,
        "recheck_timeline": null,
        "progress_bar": {
          "current_pct": null,
          "target_pct": null
        }
      }
    ],
    "next_actions": [
      { "label": null, "type": "button|link", "payload": null }
    ]
  },
  "missing_data": []
}

Now wait for the report text. When you receive it, return the JSON only. Here is the array of questions and answers: ${JSON.stringify(
                        questionsAndAnswers
                    )
                        }`,
                },
            ],
        });
        const results = JSON.parse(response.choices[0].message.content.trim());

        // console.log("results:", results);
        return results;
    } catch (error) {
        console.error("Data processing error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { askAiForAnalysis, askAi };