// api/analyze.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AnalyzeBody = {
  jdText?: string;
  resumeText?: string;
  transcriptText?: string;
  jdPdfUrl?: string;
  resumePdfUrl?: string;
  transcriptPdfUrl?: string;
};

const MAX_TEXT_CHARS = 200_000; // 防止极端大输入炸掉函数（可按需调）
const MODEL_NAME = "gemini-1.5-flash";

function clampText(s: string) {
  if (!s) return "";
  return s.length > MAX_TEXT_CHARS ? s.slice(0, MAX_TEXT_CHARS) : s;
}

async function fetchPdfText(url: string): Promise<string> {
  // 注意：Supabase public URL 可以直接 fetch
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error("PDF_FETCH_FAILED");
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  const parsed = await pdfParse(buf);
  return parsed.text || "";
}

/**
 * Gemini 偶尔会输出 ```json ... ``` 或在前后加解释，这里做一次“取第一个 JSON 对象”兜底
 */
function extractJsonObject(text: string): string {
  if (!text) return "";
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return "";
  return text.slice(first, last + 1);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ errorCode: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = (req.body ?? {}) as AnalyzeBody;

    let jdContent = (body.jdText ?? "").trim();
    let resumeContent = (body.resumeText ?? "").trim();
    let transcriptContent = (body.transcriptText ?? "").trim();

    // 1) 拉取并解析 PDF（如果给了 URL）
    try {
      if (body.jdPdfUrl) jdContent = `${jdContent}\n${await fetchPdfText(body.jdPdfUrl)}`.trim();
      if (body.resumePdfUrl) resumeContent = `${resumeContent}\n${await fetchPdfText(body.resumePdfUrl)}`.trim();
      if (body.transcriptPdfUrl) transcriptContent = `${transcriptContent}\n${await fetchPdfText(body.transcriptPdfUrl)}`.trim();
    } catch (e: any) {
      const code = e?.message === "PDF_FETCH_FAILED" ? "PDF_FETCH_FAILED" : "PDF_PARSE_FAILED";
      return res.status(400).json({ errorCode: code });
    }

    jdContent = clampText(jdContent);
    resumeContent = clampText(resumeContent);
    transcriptContent = clampText(transcriptContent);

    // 2) 基本校验
    if (!jdContent || !resumeContent || !transcriptContent) {
      return res.status(400).json({ errorCode: "MISSING_CONTENT" });
    }

    // 3) Gemini 调用
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ errorCode: "MISSING_GEMINI_API_KEY" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2,
        // Gemini 支持让它更倾向输出 JSON（不同版本 SDK/模型支持略有差异）
        // 如果你的 SDK 版本支持，会显著减少“非 JSON 输出”问题
        // @ts-ignore
        responseMimeType: "application/json",
      },
    });

    const schema = `{
  "basic_info": {
    "company_dept": "...",
    "position_level": "...",
    "interview_round": "...",
    "interviewer_profile": "...",
    "prediction": { "score": 0, "success_rate": "..." }
  },
  "competency_radar": { "professional": 0, "general": 0, "culture": 0 },
  "alignment_table": [
    { "dimension": "...", "jd_req": "...", "performance_summary": "...", "ai_match": "..." }
  ],
  "qa_full_recon": {
    "experience": [
      {
        "question": "...",
        "answer": "...",
        "feedback": "...",
        "score": 0,
        "improvement": { "diagnosis": "...", "star_plan": "..." }
      }
    ],
    "professional": [],
    "behavioral": [],
    "reverse_questions": { "my_questions": "...", "ai_eval": "...", "suggestions": [] }
  },
  "action_plan": { "resume_optimization": "...", "knowledge_gap": [], "followup_strategy": "..." }
}`;

    const prompt = `
You are an expert interview coach and evaluator.

Task:
- Align JD (job requirements), Resume (candidate background), and Transcript (actual interview answers).
- Produce a diagnostic report STRICTLY as valid JSON matching EXACTLY this schema (no extra keys, no markdown, no commentary):

Schema:
${schema}

Rules:
- Return ONLY the JSON object. No \`\`\` fences. No explanation text.
- All numeric scores are integers 0-100.
- competency_radar: provide 3 scores 0-100.
- alignment_table: include 4-7 rows, each with clear dimension and evidence.
- qa_full_recon: categorize questions into experience/professional/behavioral; include reverse_questions.
- action_plan: concrete, actionable, prioritized.

Inputs:
[JD]
${jdContent}

[RESUME]
${resumeContent}

[TRANSCRIPT]
${transcriptContent}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() ?? "";

    if (!text) {
      return res.status(500).json({ errorCode: "AI_NO_RESPONSE" });
    }

    // 4) JSON 解析（双保险）
    let jsonText = text.trim();
    let analysis: any = null;

    try {
      analysis = JSON.parse(jsonText);
    } catch {
      // 兜底：抽取第一个 JSON 对象再 parse
      const extracted = extractJsonObject(jsonText);
      if (!extracted) {
        return res.status(500).json({ errorCode: "AI_INVALID_JSON" });
      }
      try {
        analysis = JSON.parse(extracted);
      } catch {
        return res.status(500).json({ errorCode: "AI_INVALID_JSON" });
      }
    }

    return res.status(200).json({ analysis });
  } catch (e) {
    console.error("[/api/analyze] SERVER_ERROR", e);
    return res.status(500).json({ errorCode: "SERVER_ERROR" });
  }
}
