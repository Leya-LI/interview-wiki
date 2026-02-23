// api/analyze.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AnalyzeBody = {
  lang?: "zh" | "en";
  jdText?: string;
  resumeText?: string;
  transcriptText?: string;
  jdPdfUrl?: string;
  resumePdfUrl?: string;
  transcriptFileUrl?: string;
};

const MAX_TEXT_CHARS = 200_000; // 防止极端大输入炸掉函数（可按需调）

/**
 * ✅ 不写死模型：环境变量优先，否则给一个“确定存在”的默认值
 * 你 /api/models 里已经确认 models/gemini-2.5-flash 存在且支持 generateContent
 */
const DEFAULT_MODEL = "models/gemini-2.5-flash";

function getModelName() {
  // 支持你在 Vercel 里配：GEMINI_MODEL=models/gemini-2.5-flash
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (!envModel) return DEFAULT_MODEL;

  // 兼容你只写 "gemini-2.5-flash" 的情况，自动补 models/ 前缀
  if (!envModel.startsWith("models/")) return `models/${envModel}`;

  return envModel;
}

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

async function fetchTextFile(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("FILE_FETCH_FAILED");
  return await resp.text();
}

function getExtFromUrl(url: string) {
  try {
    const u = new URL(url);
    const m = u.pathname.toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : "";
  } catch {
    return "";
  }
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
    const lang: "zh" | "en" = body.lang === "en" ? "en" : "zh";
    const languageRule = lang === "zh" 
      ? "必须使用简体中文生成所有分析内容。" 
      : "All analysis content must be generated in English.";
    const OUTPUT_LANG_DESC =
      lang === "zh"
        ? "Simplified Chinese (简体中文). Do NOT mix English unless it is a proper noun (e.g., company/tool name) or a fixed enum value."
        : "English only. Do NOT output any Chinese.";

    let jdContent = (body.jdText ?? "").trim();
    let resumeContent = (body.resumeText ?? "").trim();
    let transcriptContent = (body.transcriptText ?? "").trim();

    // 1) 拉取并解析 PDF（如果给了 URL）
    try {
      if (body.jdPdfUrl) jdContent = `${jdContent}\n${await fetchPdfText(body.jdPdfUrl)}`.trim();
      if (body.resumePdfUrl) resumeContent = `${resumeContent}\n${await fetchPdfText(body.resumePdfUrl)}`.trim();

      if (body.transcriptFileUrl) {
        const ext = getExtFromUrl(body.transcriptFileUrl);
        if (ext !== "txt" && ext !== "md") {
        return res.status(400).json({ errorCode: "TRANSCRIPT_FILE_TYPE_NOT_ALLOWED" });
        }
        transcriptContent = `${transcriptContent}\n${await fetchTextFile(body.transcriptFileUrl)}`.trim();
      }
    } catch (e: any) {
      const msg = e?.message;
      const code =
      msg === "PDF_FETCH_FAILED" ? "PDF_FETCH_FAILED" :
      msg === "FILE_FETCH_FAILED" ? "FILE_FETCH_FAILED" :
      "FILE_PARSE_FAILED";
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

    const modelName = getModelName();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.2,
        // ✅ 有些模型/SDK 支持 JSON mime，会更稳定输出 JSON
        // 不支持时一般会被忽略，不影响请求
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
Role:
You are a real human interviewer and hiring committee member. Your style is concise, evidence-based, and practical.

Goal:
Given JD, Resume, and Transcript, produce an interview debrief report STRICTLY as valid JSON matching EXACTLY this schema (no extra keys, no markdown, no commentary).

Schema:
${schema}

Hard rules:
- Return ONLY the JSON object. No markdown fences. No explanations.
- ${languageRule}
- Do NOT output tags like [JD], [RESUME], [TRANSCRIPT] anywhere in the JSON.
- Avoid AI-ish phrasing. Write like a real interviewer: short sentences, specific, actionable.
- Every evaluation MUST include concrete evidence. Evidence should be short quotes or facts (<= 25 words) embedded inside the corresponding text fields.
- Scores must be conservative and calibrated:
  - 55–65: meets minimum / unclear signals
  - 66–75: good, but with gaps
  - 76–85: strong
  - 86–95: exceptional (rare, only with strong evidence)
  - Do not exceed 90 unless there are multiple hard evidences.
- alignment_table: EXACTLY 3 rows. Each row:
  - dimension: short label
  - jd_req: one sentence (what JD expects)
  - performance_summary: 2–3 sentences max. MUST include 1 evidence snippet.
  - ai_match: one of "High" | "Medium" | "Low"
  - Do NOT put score on a separate last line.
- qa_full_recon:
  - Put questions into experience / professional / behavioral.
  - For each item:
    - feedback: 2–3 sentences, must include evidence
    - score: 0–100 integer using the calibration above
    - improvement.diagnosis: 2 bullet-like lines max (no prefix like "诊断：")
    - improvement.star_plan: MUST be exactly 4 lines:
      S: ...
      T: ...
      A: ...
      R: ...
    - Keep star_plan concise (each line one sentence).
- action_plan:
  - resume_optimization: provide ONLY 2 bullet points (in a single string, separated by \\n).
  - knowledge_gap: 4–6 items only.
  - followup_strategy: ONLY 2 bullet points (in a single string, separated by \\n).
- OUTPUT LANGUAGE: ${OUTPUT_LANG_DESC}
- Fixed enum values MUST stay in English exactly as specified by schema:
  - alignment_table.ai_match must be one of: "High" | "Medium" | "Low"
  - basic_info.prediction.success_rate must be one of: "Low" | "Medium" | "Medium-High" | "High"
  Frontend will localize these enums. All other human-readable strings must follow OUTPUT LANGUAGE.

Inputs:
JD:
${jdContent}

Resume:
${resumeContent}

Transcript:
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
        return res.status(500).json({ errorCode: "AI_INVALID_JSON", raw: jsonText.slice(0, 2000) });
      }
      try {
        analysis = JSON.parse(extracted);
      } catch {
        return res.status(500).json({ errorCode: "AI_INVALID_JSON", raw: extracted.slice(0, 2000) });
      }
    }

    return res.status(200).json({
      analysis,
      meta: {
        model: modelName, // ✅ 返回给前端/日志：方便你确认到底跑的是哪个模型
      },
    });
  } catch (e) {
    console.error("[/api/analyze] SERVER_ERROR", e);
    return res.status(500).json({ errorCode: "SERVER_ERROR" });
  }
}
