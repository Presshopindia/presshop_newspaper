const axios = require("axios");

const AI_TIMEOUT_MS = 7000;

function isAiRewriteEnabled() {
  const raw = String(process.env.AI_REWRITE_ENABLED ?? "true").toLowerCase();
  return ["true", "1", "yes", "on"].includes(raw);
}

function buildPrompt(article) {
  return `Rewrite the following news article in a unique, human-readable, SEO-friendly way.
Keep it factual, neutral, and journalistic.
Do not add false information.

Return JSON:
{
title: "improved SEO title",
summary: "short engaging summary (2-3 lines)",
content: "full rewritten article in 4-6 paragraphs"
}

Article:
TITLE: ${article.title || ""}
DESCRIPTION: ${article.description || ""}
CONTENT: ${article.content || ""}
CATEGORY: ${article.category || ""}`;
}

function fallbackRewrite(article) {
  return {
    title: article.title || "Untitled",
    summary: article.description || "",
    content: article.content || article.description || "",
  };
}

function extractJsonString(rawText = "") {
  const trimmed = rawText.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return "";
}

function parseRewriteResponse(text, originalArticle) {
  const jsonCandidate = extractJsonString(text);

  if (!jsonCandidate) {
    throw new Error("AI response did not contain JSON");
  }

  const parsed = JSON.parse(jsonCandidate);

  return {
    title: String(parsed.title || originalArticle.title || "Untitled"),
    summary: String(parsed.summary || originalArticle.description || ""),
    content: String(
      parsed.content ||
        originalArticle.content ||
        originalArticle.description ||
        "",
    ),
  };
}

async function requestOpenAI(prompt, apiKey) {
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a strict journalism rewrite assistant. Always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: AI_TIMEOUT_MS,
    },
  );

  return response?.data?.choices?.[0]?.message?.content || "";
}

async function requestGemini(prompt, apiKey) {
  const model = process.env.AI_MODEL || "gemini-1.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(
    endpoint,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: AI_TIMEOUT_MS,
    },
  );

  return (
    response?.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n") || ""
  );
}

async function rewriteArticle(article) {
  if (!isAiRewriteEnabled()) {
    return fallbackRewrite(article);
  }

  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return fallbackRewrite(article);
  }

  try {
    const prompt = buildPrompt(article);
    const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

    let rawResponse = "";
    if (provider === "gemini") {
      rawResponse = await requestGemini(prompt, apiKey);
    } else {
      rawResponse = await requestOpenAI(prompt, apiKey);
    }

    return parseRewriteResponse(rawResponse, article);
  } catch (error) {
    console.warn("[AI] Rewrite failed, using original article:", error.message);
    return fallbackRewrite(article);
  }
}

module.exports = {
  rewriteArticle,
};
