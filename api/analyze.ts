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
You are a strict, evidence-based interview evaluator.

Goal:
Align JD (requirements), Resume (background), and Transcript (actual answers).
Return a diagnostic report STRICTLY as valid JSON matching EXACTLY this schema (no extra keys, no markdown, no commentary).

Schema (must match exactly):
${schema}

GLOBAL RULES (must follow):
- Output ONLY one JSON object. No \`\`\` fences. No prose before/after JSON.
- Do NOT invent facts not present in inputs. If something is unknown, infer conservatively or state uncertainty in existing text fields (do NOT add new keys).
- Avoid generic template phrases. Every claim must be grounded in evidence from JD/Resume/Transcript.
- All numeric scores are integers 0-100.
- Prefer conservative scoring. Default is 50 unless clear evidence supports higher.
- Never give >=85 unless the transcript shows: structured reasoning + role-relevant depth + concrete details (numbers, trade-offs, constraints).
- If evidence is weak/ambiguous, score must be <=60.

EVIDENCE REQUIREMENT:
- alignment_table: each row MUST include:
  - dimension: concrete competency/requirement dimension (e.g. "Metrics-driven product thinking", "System design trade-offs", "Stakeholder management")
  - jd_req: quote or tightly paraphrase the JD requirement (short)
  - performance_summary: MUST cite specific evidence from [TRANSCRIPT] and/or [RESUME].
    Use one short excerpt or paraphrase (<=25 words) plus what it implies.
  - ai_match: one of: "High" | "Medium" | "Low" (use exactly these 3 values)
- qa_full_recon (each item):
  - question: reconstruct from transcript (or the best approximation)
  - answer: summarize what candidate actually said (not what they should have said)
  - feedback: MUST be critique-first:
    1) What was missing/weak (specific)
    2) Why it matters for this role (tie back to JD)
    3) What to improve next time (specific)
    Also include a short evidence reference from transcript (<=25 words) or paraphrase.
  - score: conservative integer 0-100 based on rubric below
  - improvement.diagnosis: 2-4 bullet-like sentences, concrete gaps
  - improvement.star_plan: rewrite the answer using STAR/structured format, keep it realistic and consistent with resume

SCORING RUBRIC (apply to each QA score and also guide overall prediction score):
- 0-39: incorrect / evasive / no relevant content
- 40-59: partially relevant but vague; lacks structure/evidence
- 60-74: mostly relevant; some structure; limited depth or missing trade-offs
- 75-84: strong; clear structure; correct; role-relevant; some quantified impact
- 85-100: exceptional; deep trade-offs; strong evidence; numbers; clear ownership and impact

OUTPUT EXPECTATIONS:
- basic_info:
  - company_dept: infer from JD if possible (company/team/department). If unknown, put the role/company name from JD title.
  - position_level: infer level/title from JD or resume.
  - interview_round: infer from transcript/JD context. If unclear, use a reasonable guess (e.g. "Round 1") but mention uncertainty in interviewer_profile or interview_round text.
  - interviewer_profile: infer from transcript cues (e.g. HR/EM/Tech lead). If unclear, "Unknown".
  - prediction.score: overall match score 0-100 using conservative rubric.
  - prediction.success_rate: a short label like "Low", "Medium", "Medium-High", "High" (do not use % unless clearly justified).
- competency_radar:
  - professional/general/culture: conservative 0-100. Professional = role skills; General = communication/structure; Culture = values/working style signals.
- alignment_table:
  - 4-7 rows, covering must-have skills + soft skills + role-specific areas.
  - Each row must have evidence.
- qa_full_recon:
  - experience/professional/behavioral: try to include at least 2 items each if transcript provides them.
  - If transcript lacks enough questions for a category, keep the array shorter but do NOT invent; still return arrays (possibly empty).
  - reverse_questions:
    - my_questions: what candidate asked (or "None stated")
    - ai_eval: critique quality of questions relative to JD (evidence-based)
    - suggestions: 3-6 strong reverse questions tailored to JD
- action_plan:
  - resume_optimization: provide 4-8 bullet lines (newline separated) with resume bullet rewrites anchored in resume + interview content.
  - knowledge_gap: 5-10 items, specific topics/skills to study.
  - followup_strategy: concrete plan for next round (what to practice, how to answer, what artifacts to prepare)

NOW analyze the inputs.

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
