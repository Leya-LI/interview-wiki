import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "zh";

export const translations = {
  en: {
    // Navigation
    nav: {
      title: "Interview Wiki",
      newReview: "New Review",
      history: "History",
      recent: "Recent Reviews",
      settings: "Settings",
      logout: "Log out",
      signIn: "Sign In",
      getStarted: "Get Started"
    },
    // Landing
    landing: {
      badge: "AI-Powered Interview Coach",
      heroTitle: "Master Your Next Interview with",
      heroTitleAccent: "Deep Alignment",
      heroDesc: "Stop guessing. Upload your JD, Resume, and Interview Transcript to get a diagnostic-grade review report powered by Gemini AI.",
      viewSample: "View Sample Report",
      feature1: {
        title: "3-Way Alignment",
        desc: "We analyze the gap between the Job Description, your Resume, and your actual Interview Answers."
      },
      feature2: {
        title: "Diagnostic Feedback",
        desc: "Get specific, actionable advice on every answer. Score your performance on professional, cultural, and general fit."
      },
      feature3: {
        title: "Action Plan",
        desc: "Receive a tailored improvement roadmap, including resume optimizations and knowledge gap filling."
      },
      footer: "© 2026 Interview Wiki. Powered by Gemini 1.5 Flash."
    },
    // New Review
    new: {
      title: "Create New Review",
      desc: "Upload your interview context to generate a deep diagnostic report. We align the Job Description, your Resume, and the Interview Transcript.",
      jd: "Job Description",
      resume: "Your Resume",
      transcript: "Interview Transcript",
      pasteText: "Paste Text",
      uploadFile: "Upload File",
      placeholderJD: "Paste the full job description here...",
      placeholderResume: "Paste your resume text here...",
      placeholderTranscript: "Interviewer: Tell me about yourself...\nMe: I started my career at...",
      uploadJD: "Upload JD (PDF)",
      uploadResume: "Upload Resume (PDF)",
      uploadTranscript: "Upload Transcript (TXT/MD)",
      dragDrop: "Drag & drop or click to browse",
      selectFile: "Select File",
      chars: "chars",
      noFile: "No file selected",
      ready: "Ready",
      generate: "Generate Review Report",
      analyzing: "Analyzing with Gemini...",
      estTime: "Estimated time: ~30 seconds. Powered by Gemini 1.5 Flash.",
      errorMissing: "Missing Information",
      errorDesc: "Please provide JD, Resume, and Transcript to generate a report."
    },

    error: {
      generateFailed: "Generation Failed",
      serverError: "Server error. Please try again later.",
      uploadFailed: "Upload failed. Please retry.",
      onlyPdf: "Only PDF files are supported.",
      fileTooLarge: "File is too large (max 5MB).",
      dragRelease: "Release to upload (PDF ≤ 5MB)",
      fileInvalid: "File is invalid",
      fileSelected: "File selected",
      uploading: "Uploading...",
      retry: "Retry",
      remove: "Remove",
      reselect: "Reselect",
      view: "View"
    },
    // Report
    report: {
      id: "ID",
      export: "Export PDF",
      share: "Share",
      context: "Interview Context",
      company: "Company",
      round: "Round",
      interviewer: "Interviewer",
      prediction: "Prediction",
      overallScore: "Overall Match Score",
      radarTitle: "Competency Radar",
      radarDesc: "Visualizing your strengths vs. role requirements",
      alignmentTitle: "Alignment Analysis",
      alignmentDesc: "Key gaps between JD requirements and your performance",
      qaTitle: "Q&A Reconstruction & Coaching",
      qaDesc: "Detailed breakdown of your answers with AI-suggested improvements",
      tabs: {
        experience: "Experience",
        technical: "Technical",
        behavioral: "Behavioral",
        reverse: "Reverse Questions"
      },
      qaItems: {
        excellent: "Excellent",
        needsWork: "Needs Work",
        summary: "Your Answer Summary",
        coaching: "AI Coaching",
        tryAdding: "Try adding:"
      },
      actionPlan: {
        resumeTitle: "Resume Optimization",
        resumeBullets: "Suggested Bullet Points",
        copy: "Copy",
        knowledgeGaps: "Knowledge Gaps",
        focusAreas: "Focus on these areas before your next round. The interviewer probed deep on distributed systems and you seemed hesitant."
      }
    },
    // History
    history: {
      title: "Review History",
      desc: "Your past interview analyses.",
      empty: "No history yet. Start your first review!",
      ago: "ago",
      days: "days",
      week: "week"
    }
  },
  zh: {
    // Navigation
    nav: {
      title: "面试维基",
      newReview: "新建复盘",
      history: "历史记录",
      recent: "最近复盘",
      settings: "设置",
      logout: "退出登录",
      signIn: "登录",
      getStarted: "立即开始"
    },
    // Landing
    landing: {
      badge: "AI 驱动的面试教练",
      heroTitle: "通过",
      heroTitleAccent: "深度对齐",
      heroTitleSuffix: "掌控你的下一次面试",
      heroDesc: "告别盲目猜测。上传职位描述 (JD)、简历和面试逐字稿，获取由 Gemini AI 驱动的诊断级复盘报告。",
      viewSample: "查看示例报告",
      feature1: {
        title: "三方对齐",
        desc: "我们分析职位描述、个人简历以及你实际面试回答之间的差距。"
      },
      feature2: {
        title: "诊断性反馈",
        desc: "针对每个回答获取具体的、可操作的建议。评估你在专业、文化和通用素质方面的表现。"
      },
      feature3: {
        title: "行动计划",
        desc: "获取定制的提升路线图，包括简历优化建议和知识盲点补充。"
      },
      footer: "© 2026 面试维基。由 Gemini 1.5 Flash 提供支持。"
    },
    // New Review
    new: {
      title: "创建新复盘",
      desc: "上传面试背景信息以生成深度诊断报告。我们将对齐职位描述、个人简历和面试逐字稿。",
      jd: "职位描述 (JD)",
      resume: "个人简历",
      transcript: "面试逐字稿",
      pasteText: "粘贴文本",
      uploadFile: "上传文件",
      placeholderJD: "请在此处粘贴完整的职位描述...",
      placeholderResume: "请在此处粘贴你的简历内容...",
      placeholderTranscript: "面试官：请介绍一下你自己...\n我：我的职业生涯开始于...",
      uploadJD: "上传 JD (PDF)",
      uploadResume: "上传简历 (PDF)",
      uploadTranscript: "上传逐字稿 (TXT/MD)",
      dragDrop: "拖拽文件至此或点击浏览",
      selectFile: "选择文件",
      chars: "字符",
      noFile: "未选择文件",
      ready: "已就绪",
      generate: "生成复盘报告",
      analyzing: "Gemini 正在分析中...",
      estTime: "预计时间：~30 秒。由 Gemini 1.5 Flash 提供支持。",
      errorMissing: "缺少信息",
      errorDesc: "请提供 JD、简历和逐字稿以生成报告。"
    },

    error: {
      generateFailed: "生成失败",
      serverError: "服务器错误，请稍后重试。",
      uploadFailed: "上传失败，请重试。",
      onlyPdf: "仅支持 PDF 文件。",
      fileTooLarge: "文件过大（最大 5MB）。",
      dragRelease: "松手即可上传（PDF ≤ 5MB）",
      fileInvalid: "文件异常",
      fileSelected: "已选择文件",
      uploading: "上传中...",
      retry: "重试",
      remove: "移除",
      reselect: "重新选择",
      view: "查看"
    },
    // Report
    report: {
      id: "编号",
      export: "导出 PDF",
      share: "分享",
      context: "面试背景",
      company: "公司",
      round: "面试轮次",
      interviewer: "面试官",
      prediction: "预测结果",
      overallScore: "综合匹配得分",
      radarTitle: "胜任力雷达图",
      radarDesc: "可视化你的优势与岗位要求的匹配度",
      alignmentTitle: "对齐分析",
      alignmentDesc: "职位要求与你表现之间的关键差距",
      qaTitle: "问答还原与辅导",
      qaDesc: "面试回答的详细解析及 AI 改进建议",
      tabs: {
        experience: "项目经验",
        technical: "技术能力",
        behavioral: "行为面试",
        reverse: "反向提问"
      },
      qaItems: {
        excellent: "表现优异",
        needsWork: "有待改进",
        summary: "你的回答摘要",
        coaching: "AI 辅导",
        tryAdding: "尝试补充："
      },
      actionPlan: {
        resumeTitle: "简历优化",
        resumeBullets: "建议描述要点",
        copy: "复制",
        knowledgeGaps: "知识盲点",
        focusAreas: "在下一轮面试前重点关注这些领域。面试官在分布式系统方面进行了深挖，你当时显得有些犹豫。"
      }
    },
    // History
    history: {
      title: "复盘历史",
      desc: "你过去的面试分析记录。",
      empty: "暂无记录。开始你的第一次复盘吧！",
      ago: "前",
      days: "天",
      week: "周"
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any; // Using nested access via proxy or path
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh");

  const getNestedTranslation = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj) || path;
  };

  const t = (path: string) => {
    return getNestedTranslation(translations[language], path);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
