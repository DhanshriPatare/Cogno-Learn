import { GoogleGenAI, Type } from "@google/genai";

type ChatTurn = { role: "user" | "model"; text: string };

const viteEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

const apiKey = viteEnv?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const MODEL_CANDIDATES = [
  viteEnv?.VITE_GEMINI_MODEL,
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
].filter((value): value is string => Boolean(value));

const DEFAULT_SYSTEM_INSTRUCTION =
  "You are Cogno, an expert AI tutor. Your goal is to help students learn effectively. Be encouraging, clear, and concise.";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getFriendlyErrorMessage(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  if (message.includes("language not supported") || message.includes("languae not supported")) {
    return "The AI service rejected the requested language, so Cogno switched to a supported default. Please try again.";
  }

  if (message.includes("api key")) {
    return "The Gemini API key is missing or invalid.";
  }

  return "Error connecting to AI tutor.";
}

async function generateText(
  prompt: string,
  history: ChatTurn[] = [],
  config: Record<string, unknown> = {},
) {
  let lastError: unknown;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          ...history.map((turn) => ({
            role: turn.role,
            parts: [{ text: turn.text }],
          })),
          { role: "user", parts: [{ text: prompt }] },
        ],
        config: {
          systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
          ...config,
        },
      });

      return response.text || "";
    } catch (error) {
      lastError = error;
      console.error(`Gemini request failed for model "${model}":`, error);
    }
  }

  throw lastError;
}

async function generateJson<T>(
  prompt: string,
  schema: Record<string, unknown>,
  history: ChatTurn[] = [],
) {
  const text = await generateText(prompt, history, {
    responseMimeType: "application/json",
    responseSchema: schema,
  });

  return JSON.parse(text || "{}") as T;
}

export const askGemini = async (prompt: string, history: ChatTurn[] = []) => {
  try {
    const responseText = await generateText(prompt, history);
    return responseText || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return getFriendlyErrorMessage(error);
  }
};

export const analyzeMood = async (moodDescription: string) => {
  try {
    return await generateJson<{
      mood: string;
      suggestion: string;
      activity: string;
      imageKeyword: string;
      overlayColor: string;
    }>(
      `Analyze this mood: "${moodDescription}". Return a JSON object with: mood (emoji), suggestion (short advice), activity (one of: Smash, Breathe, Pop, Ripple, Burn), imageKeyword (for Unsplash), overlayColor (hex).`,
      {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          activity: { type: Type.STRING },
          imageKeyword: { type: Type.STRING },
          overlayColor: { type: Type.STRING },
        },
        required: ["mood", "suggestion", "activity", "imageKeyword", "overlayColor"],
      },
    );
  } catch (error) {
    console.error("Mood Analysis Error:", error);
    return null;
  }
};

export const generateStudyPlan = async (topic: string, timeframe: string) => {
  try {
    return await generateJson<
      Array<{
        day: number;
        focus: string;
        tasks: string[];
      }>
    >(
      `Generate a study plan for "${topic}" to be completed by "${timeframe}". Return a JSON array of objects, each with: day (number), focus (string), tasks (array of strings).`,
      {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER },
            focus: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["day", "focus", "tasks"],
        },
      },
    );
  } catch (error) {
    console.error("Study Plan Error:", error);
    return [];
  }
};

export const evaluateFeynman = async (concept: string, explanation: string) => {
  try {
    return await generateJson<{
      score: number;
      feedback: string;
      gaps: string[];
    }>(
      `Evaluate this explanation of "${concept}" using the Feynman Technique (explain like I'm 10). Explanation: "${explanation}". Return JSON: score (0-100), feedback (string), gaps (array of strings).`,
      {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "feedback", "gaps"],
      },
    );
  } catch (error) {
    console.error("Feynman Evaluation Error:", error);
    return null;
  }
};

export const sparWithAI = async (topic: string, argument: string, history: ChatTurn[] = []) => {
  try {
    return await generateJson<{
      rebuttal: string;
      logicScore: number;
    }>(
      `We are debating "${topic}". My argument: "${argument}". Rebut my argument as a devil's advocate. Return JSON: rebuttal (string), logicScore (0-100, how well I defended my point).`,
      {
        type: Type.OBJECT,
        properties: {
          rebuttal: { type: Type.STRING },
          logicScore: { type: Type.NUMBER },
        },
        required: ["rebuttal", "logicScore"],
      },
      history,
    );
  } catch (error) {
    console.error("Debate Error:", error);
    return null;
  }
};

export const getInterviewQuestion = async (topic: string) => {
  try {
    const responseText = await generateText(
      `Generate a challenging technical interview question about "${topic}". Return just the question text.`,
    );

    return responseText || "What is the time complexity of a binary search?";
  } catch (error) {
    console.error("Interview Question Error:", error);
    return "Describe the difference between a process and a thread.";
  }
};

export const evaluateInterviewAnswer = async (question: string, answer: string) => {
  try {
    return await generateJson<{
      score: number;
      feedback: string;
      hired: boolean;
    }>(
      `Question: "${question}". Answer: "${answer}". Grade this technical interview answer. Return JSON: score (0-100), feedback (string), hired (boolean, true if score >= 75).`,
      {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          hired: { type: Type.BOOLEAN },
        },
        required: ["score", "feedback", "hired"],
      },
    );
  } catch (error) {
    console.error("Interview Answer Error:", error);
    return null;
  }
};
