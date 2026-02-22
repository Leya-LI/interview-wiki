import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY in Vercel environment",
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: {
          "x-goog-api-key": key,
        },
      }
    );

    const data = await response.json();

    const models = Array.isArray(data?.models) ? data.models : [];

    const usableModels = models
      .filter(
        (m: any) =>
          Array.isArray(m?.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m: any) => ({
        name: m.name,
        displayName: m.displayName,
        supportedGenerationMethods: m.supportedGenerationMethods,
      }));

    return res.status(200).json({
      ok: true,
      totalModels: models.length,
      generateContentModels: usableModels,
    });
  } catch (error: any) {
    console.error("MODELS_ERROR", error);
    return res.status(500).json({
      error: error?.message || String(error),
    });
  }
}
