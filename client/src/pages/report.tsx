// client/src/pages/report.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  User,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";

type Analysis = {
  basic_info?: {
    company_dept?: string;
    position_level?: string;
    interview_round?: string;
    interviewer_profile?: string;
    prediction?: { score?: number; success_rate?: string };
  };
  competency_radar?: { professional?: number; general?: number; culture?: number };
  alignment_table?: Array<{
    dimension?: string;
    jd_req?: string;
    performance_summary?: string;
    ai_match?: string; // "High" | "Medium" | "Low"
  }>;
  qa_full_recon?: {
    experience?: Array<QAItem>;
    professional?: Array<QAItem>;
    behavioral?: Array<QAItem>;
    reverse_questions?: {
      my_questions?: string;
      ai_eval?: string;
      suggestions?: string[];
    };
  };
  action_plan?: {
    resume_optimization?: string;
    knowledge_gap?: string[];
    followup_strategy?: string;
  };
};

type QAItem = {
  question?: string;
  answer?: string;
  feedback?: string;
  score?: number;
  improvement?: { diagnosis?: string; star_plan?: string };
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function clampScore(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** 将 ai_match（High/Medium/Low）映射为 tone */
function matchToTone(aiMatch?: string): "good" | "warn" | "info" {
  const s = (aiMatch ?? "").toLowerCase();
  if (s.includes("high")) return "good";
  if (s.includes("low")) return "warn";
  return "info";
}

/** High/Medium/Low 的本地化显示 */
function tMatch(aiMatch: string | undefined, language: "zh" | "en") {
  const v = (aiMatch ?? "").trim();
  if (!v) return language === "zh" ? "未知" : "Unknown";
  if (language === "zh") {
    if (v === "High") return "高匹配";
    if (v === "Medium") return "中匹配";
    if (v === "Low") return "低匹配";
  }
  return v;
}

function tLevel(successRate: string | undefined, language: "zh" | "en") {
  const v = (successRate ?? "").trim();
  if (!v) return "-";
  if (language === "zh") {
    const map: Record<string, string> = {
      Low: "低",
      Medium: "中",
      "Medium-High": "中高",
      High: "高",
    };
    return map[v] ?? v;
  }
  return v;
}

export default function ReportPage() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    if (id === "result") {
      const parsed = safeJsonParse<Analysis>(localStorage.getItem("latestReport"));
      if (parsed) {
        setAnalysis(parsed);
        return;
      }

      toast({
        title: language === "zh" ? "未找到报告数据" : "No report data found",
        description:
          language === "zh"
            ? "localStorage 里没有 latestReport。请回到“新建复盘”重新生成。"
            : "latestReport is missing in localStorage. Go back and generate a new report.",
        variant: "destructive",
      });
      setAnalysis(null);
      return;
    }

    toast({
      title: language === "zh" ? "尚未实现" : "Not implemented yet",
      description:
        language === "zh"
          ? "当前只支持 /report/result（从 localStorage 读取最新报告）。"
          : "Currently only /report/result is supported (reads from localStorage).",
    });
    setAnalysis(null);
  }, [id, language, toast]);

  const basicInfo = useMemo(() => {
    const bi = analysis?.basic_info;
    const pred = bi?.prediction;
    const score = clampScore(pred?.score);

    const predictionLabel =
      score >= 80
        ? language === "zh"
          ? "较高通过概率"
          : "Higher chance"
        : score >= 60
          ? language === "zh"
            ? "中等通过概率"
            : "Medium chance"
          : language === "zh"
            ? "偏低通过概率"
            : "Lower chance";

    return {
      company: bi?.company_dept || "-",
      position: bi?.position_level || "-",
      round: bi?.interview_round || "-",
      interviewer: bi?.interviewer_profile || "-",
      score,
      successRate: pred?.success_rate || "-",
      predictionLabel,
    };
  }, [analysis, language]);

  const radarData = useMemo(() => {
    const r = analysis?.competency_radar;
    return [
      { subject: language === "zh" ? "专业匹配" : "Professional", A: clampScore(r?.professional), fullMark: 100 },
      { subject: language === "zh" ? "通用能力" : "General", A: clampScore(r?.general), fullMark: 100 },
      { subject: language === "zh" ? "文化契合" : "Culture", A: clampScore(r?.culture), fullMark: 100 },
    ];
  }, [analysis, language]);

  const alignmentRows = useMemo(() => {
    return (analysis?.alignment_table ?? []).slice(0, 3);
  }, [analysis]);

  const qa = analysis?.qa_full_recon;

  const resumeBullets = useMemo(() => {
    const raw = analysis?.action_plan?.resume_optimization ?? "";
    const lines = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    return lines.length ? lines : raw ? [raw] : [];
  }, [analysis]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: language === "zh" ? "已复制" : "Copied",
        description: language === "zh" ? "内容已复制到剪贴板" : "Copied to clipboard",
      });
    } catch {
      toast({
        title: language === "zh" ? "复制失败" : "Copy failed",
        description: language === "zh" ? "请手动复制" : "Please copy manually",
        variant: "destructive",
      });
    }
  };

  if (!analysis) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>{language === "zh" ? "报告未加载" : "Report not loaded"}</CardTitle>
            <CardDescription>
              {language === "zh"
                ? "请从“新建复盘”生成后跳转到 /report/result，并确保浏览器未清空 localStorage。"
                : "Generate from /new then navigate to /report/result. Ensure localStorage is not cleared."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {t("report.id")}: {id}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {basicInfo.position}{" "}
            <span className="text-muted-foreground font-medium">
              {language === "zh" ? "@" : "at"}
            </span>{" "}
            {basicInfo.company}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                title: language === "zh" ? "待实现" : "TODO",
                description:
                  language === "zh"
                    ? "导出 PDF 需要可打印模板。"
                    : "Export PDF requires a printable template.",
              })
            }
          >
            <Download className="mr-2 h-4 w-4" /> {t("report.export")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyText(window.location.href)}>
            <Share2 className="mr-2 h-4 w-4" /> {t("report.share")}
          </Button>
        </div>
      </div>

      {/* Context + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>{t("report.context")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {t("report.company")}
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  {basicInfo.company}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {t("report.round")}
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {basicInfo.round}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {t("report.interviewer")}
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {basicInfo.interviewer}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {t("report.prediction")}
                </span>
                <div className="flex items-center gap-2 font-bold text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  {basicInfo.predictionLabel} ({tLevel(basicInfo.successRate, language)})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("report.overallScore")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-6xl font-bold text-primary tabular-nums tracking-tighter">
              {basicInfo.score}
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    dot <= Math.max(1, Math.round(basicInfo.score / 20))
                      ? "bg-primary"
                      : "bg-primary/20"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 修改点 1: 比例调整为 35% vs 剩余部分 */}
      <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-6">
        {/* 雷达图卡 */}
        <Card className="h-[360px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t("report.radarTitle")}
            </CardTitle>
            <CardDescription>{t("report.radarDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar
                  name="Candidate"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 对齐分析卡 */}
        <Card className="h-[360px] flex flex-col">
          <CardHeader>
            <CardTitle>{t("report.alignmentTitle")}</CardTitle>
            <CardDescription>{t("report.alignmentDesc")}</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-3 p-6 pt-0">
            {alignmentRows.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {language === "zh" ? "暂无对齐分析结果。" : "No alignment results."}
              </div>
            ) : (
              alignmentRows.map((row, idx) => {
                const tone = matchToTone(row.ai_match);
                const boxClass =
                  tone === "good"
                    ? "bg-green-50 border-green-100"
                    : tone === "warn"
                      ? "bg-yellow-50 border-yellow-100"
                      : "bg-blue-50 border-blue-100";

                const Icon =
                  tone === "good" ? CheckCircle2 : tone === "warn" ? AlertTriangle : Trophy;

                const iconColor =
                  tone === "good"
                    ? "text-green-600"
                    : tone === "warn"
                      ? "text-yellow-600"
                      : "text-blue-600";

                const badgeCls =
                  tone === "good"
                    ? "bg-green-600 hover:bg-green-700"
                    : tone === "warn"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-blue-600 hover:bg-blue-700";

                return (
                  <div key={idx} className={`flex items-start gap-3 p-4 rounded-lg border ${boxClass}`}>
                    <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />

                    <div className="min-w-0 w-full">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-sm leading-snug break-words">
                          {row.dimension || (language === "zh" ? `维度 ${idx + 1}` : `Dimension ${idx + 1}`)}
                        </h4>
                        <Badge className={badgeCls}>
                          {tMatch(row.ai_match, language)}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap break-words leading-relaxed">
                        {row.performance_summary || row.jd_req || "-"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* QA */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>{t("report.qaTitle")}</CardTitle>
          <CardDescription>{t("report.qaDesc")}</CardDescription>
        </CardHeader>

        <div className="p-0">
          <Tabs defaultValue="experience" className="w-full">
            <div className="px-6 py-4 border-b">
              <TabsList>
                <TabsTrigger value="experience">{t("report.tabs.experience")}</TabsTrigger>
                <TabsTrigger value="technical">{t("report.tabs.technical")}</TabsTrigger>
                <TabsTrigger value="behavioral">{t("report.tabs.behavioral")}</TabsTrigger>
                <TabsTrigger value="reverse">{t("report.tabs.reverse")}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="experience" className="m-0">
              <QAList items={qa?.experience ?? []} />
            </TabsContent>

            <TabsContent value="technical" className="m-0">
              <QAList items={qa?.professional ?? []} />
            </TabsContent>

            <TabsContent value="behavioral" className="m-0">
              <QAList items={qa?.behavioral ?? []} />
            </TabsContent>

            <TabsContent value="reverse" className="m-0">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    {language === "zh" ? "你的反问" : "Your questions"}
                  </h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border whitespace-pre-wrap break-words">
                    {qa?.reverse_questions?.my_questions || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> {language === "zh" ? "评价" : "Evaluation"}
                  </h4>
                  <p className="text-sm text-foreground bg-primary/5 border border-primary/10 p-4 rounded-md whitespace-pre-wrap break-words">
                    {qa?.reverse_questions?.ai_eval || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    {language === "zh" ? "建议问题" : "Suggestions"}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {(qa?.reverse_questions?.suggestions ?? []).length ? (
                      qa!.reverse_questions!.suggestions!.map((s, i) => (
                        <div key={i} className="bg-muted/30 border rounded-md p-3 text-sm whitespace-pre-wrap break-words">
                          {s}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">-</div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-purple-500 shadow-sm">
          <CardHeader>
            <CardTitle>{t("report.actionPlan.resumeTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t("report.actionPlan.resumeBullets")}</h4>

              {resumeBullets.length ? (
                resumeBullets.map((line, i) => (
                  <div
                    key={i}
                    className="bg-muted p-3 rounded text-sm font-mono text-muted-foreground relative group cursor-pointer hover:bg-muted/80 transition-colors whitespace-pre-wrap break-words"
                    onClick={() => copyText(line)}
                    title={language === "zh" ? "点击复制" : "Click to copy"}
                  >
                    <span className="absolute top-2 right-2 text-xs bg-background border px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("report.actionPlan.copy")}
                    </span>
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">-</div>
              )}
            </div>

            {analysis.action_plan?.followup_strategy ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">
                  {language === "zh" ? "跟进策略" : "Follow-up strategy"}
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border whitespace-pre-wrap break-words leading-relaxed">
                  {analysis.action_plan.followup_strategy}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500 shadow-sm">
          <CardHeader>
            <CardTitle>{t("report.actionPlan.knowledgeGaps")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {(analysis.action_plan?.knowledge_gap ?? []).length ? (
                analysis.action_plan!.knowledge_gap!.slice(0, 12).map((g, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="px-3 py-1 text-sm max-w-full whitespace-normal break-words leading-snug"
                  >
                    {g}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">-</div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{t("report.actionPlan.focusAreas")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QAList({ items }: { items: QAItem[] }) {
  const { t, language } = useLanguage();

  if (!items.length) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground italic">
        {language === "zh" ? "暂无该分类问答解析。" : "No Q&A items in this category."}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {items.slice(0, 12).map((it, idx) => {
        const score = clampScore(it.score);
        const label = score >= 80 ? t("report.qaItems.excellent") : t("report.qaItems.needsWork");
        const badgeClass = score >= 80 ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600";

        return (
          <div key={idx} className="p-6 hover:bg-muted/5 transition-colors">
            <div className="flex justify-between items-start mb-6 gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Badge variant="outline" className="font-mono text-muted-foreground mt-1 shrink-0">
                  Q{idx + 1}
                </Badge>
                <h3 className="font-semibold text-lg leading-snug whitespace-normal break-words">
                  {it.question || "-"}
                </h3>
              </div>
              <Badge className={`${badgeClass} shrink-0`}>
                {label} ({score}/100)
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  {t("report.qaItems.summary")}
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-dashed leading-relaxed whitespace-pre-wrap break-words">
                  {it.answer || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> {t("report.qaItems.coaching")}
                </h4>
                <div className="bg-primary/5 border border-primary/10 p-5 rounded-lg space-y-3">
                  <p className="text-sm font-medium text-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {it.feedback || "-"}
                  </p>

                  {(it.improvement?.diagnosis || it.improvement?.star_plan) ? (
                    <div className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/30 space-y-3 mt-4">
                      {it.improvement?.diagnosis ? (
                        <div className="whitespace-pre-wrap break-words">
                          <strong className="text-xs text-primary/80">{language === "zh" ? "诊断：" : "Diagnosis: "}</strong>
                          <span className="text-foreground/80">{it.improvement.diagnosis}</span>
                        </div>
                      ) : null}
                      {it.improvement?.star_plan ? (
                        <div className="whitespace-pre-wrap break-words">
                          <strong className="text-xs text-primary/80">{language === "zh" ? "STAR 改写：" : "STAR rewrite: "}</strong>
                          <div className="mt-1 bg-background/50 p-3 rounded border border-primary/10 italic text-foreground/70">
                            {it.improvement.star_plan}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
