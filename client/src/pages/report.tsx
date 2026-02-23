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
    ai_match?: string;
  }>;
  qa_full_recon?: {
    experience?: Array<{
      question?: string;
      answer?: string;
      feedback?: string;
      score?: number;
      improvement?: { diagnosis?: string; star_plan?: string };
    }>;
    professional?: Array<{
      question?: string;
      answer?: string;
      feedback?: string;
      score?: number;
      improvement?: { diagnosis?: string; star_plan?: string };
    }>;
    behavioral?: Array<{
      question?: string;
      answer?: string;
      feedback?: string;
      score?: number;
      improvement?: { diagnosis?: string; star_plan?: string };
    }>;
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

function matchToTone(aiMatch?: string): "good" | "warn" | "info" {
  const s = (aiMatch ?? "").toLowerCase();
  if (s.includes("high") || s.includes("strong") || s.includes("match") || s.includes("excellent")) return "good";
  if (s.includes("low") || s.includes("gap") || s.includes("weak") || s.includes("poor")) return "warn";
  return "info";
}

export default function ReportPage() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    // 只处理你当前流程：/report/result
    if (id === "result") {
      const parsed = safeJsonParse<Analysis>(localStorage.getItem("latestReport"));
      if (parsed) {
        setAnalysis(parsed);
        return;
      }

      // 没拿到就提示（别静默展示模板）
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

    // 其他 id：你未来可以做历史记录查询，这里先提示
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

    return {
      company: bi?.company_dept || "-",
      position: bi?.position_level || "-",
      round: bi?.interview_round || "-",
      interviewer: bi?.interviewer_profile || "-",
      score,
      successRate: pred?.success_rate || "-",
      // 你 schema 里 prediction 没有“中文/英文标签”，我们就用 successRate+score 表示
      predictionLabel:
        score >= 80
          ? (language === "zh" ? "较高通过概率" : "Higher chance")
          : score >= 60
            ? (language === "zh" ? "中等通过概率" : "Medium chance")
            : (language === "zh" ? "偏低通过概率" : "Lower chance"),
    };
  }, [analysis, language]);

  const radarData = useMemo(() => {
    const r = analysis?.competency_radar;
    return [
      {
        subject: language === "zh" ? "专业匹配" : "Professional",
        A: clampScore(r?.professional),
        fullMark: 100,
      },
      {
        subject: language === "zh" ? "通用能力" : "General",
        A: clampScore(r?.general),
        fullMark: 100,
      },
      {
        subject: language === "zh" ? "文化契合" : "Culture",
        A: clampScore(r?.culture),
        fullMark: 100,
      },
    ];
  }, [analysis, language]);

  const alignment = analysis?.alignment_table ?? [];
  const qa = analysis?.qa_full_recon;

  const resumeBullets = useMemo(() => {
    const raw = analysis?.action_plan?.resume_optimization ?? "";
    // 允许模型返回多行 bullet，这里尽量拆一下
    const lines = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    return lines.length ? lines : raw ? [raw] : [];
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>{language === "zh" ? "报告未加载" : "Report not loaded"}</CardTitle>
            <CardDescription>
              {language === "zh"
                ? "请确认你是从“新建复盘”生成后跳转到 /report/result，并且浏览器没有清空 localStorage。"
                : "Generate from /new then navigate to /report/result. Ensure localStorage is not cleared."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
                    ? "导出 PDF 需要你把 analysis 渲染到可打印模板（我可以下一步帮你做）。"
                    : "Export PDF requires a printable template (I can help next).",
              })
            }
          >
            <Download className="mr-2 h-4 w-4" /> {t("report.export")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyText(window.location.href)}
          >
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
                  {basicInfo.predictionLabel} ({basicInfo.successRate})
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

      {/* Radar + Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t("report.radarTitle")}
            </CardTitle>
            <CardDescription>{t("report.radarDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
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

        <Card>
          <CardHeader>
            <CardTitle>{t("report.alignmentTitle")}</CardTitle>
            <CardDescription>{t("report.alignmentDesc")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {alignment.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {language === "zh" ? "暂无对齐分析结果。" : "No alignment results."}
              </div>
            ) : (
              <div className="space-y-3">
                {alignment.slice(0, 7).map((row, idx) => {
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

                  return (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${boxClass}`}>
                      <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {row.dimension || (language === "zh" ? `维度 ${idx + 1}` : `Dimension ${idx + 1}`)}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {row.performance_summary || row.jd_req || "-"}
                        </p>
                        {row.ai_match ? (
                          <div className="mt-2">
                            <Badge variant="secondary">{row.ai_match}</Badge>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QA */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>{t("report.qaTitle")}</CardTitle>
          <CardDescription>{t("report.qaDesc")}</CardDescription>
        </CardHeader>

        <div className="p-0">
          <Tabs defaultValue="experience" className="w-full">
            <div className="px-6 py-4 border-b">
              <TabsList>
                <TabsTrigger value="experience">{t("report.tabs.experience")}</TabsTrigger>
                {/* 你 translations 里是 technical，但 schema 里叫 professional，这里做映射 */}
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
                  <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border whitespace-pre-wrap">
                    {qa?.reverse_questions?.my_questions || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> {language === "zh" ? "AI 评价" : "AI evaluation"}
                  </h4>
                  <p className="text-sm text-foreground bg-primary/5 border border-primary/10 p-4 rounded-md whitespace-pre-wrap">
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
                        <div key={i} className="bg-muted/30 border rounded-md p-3 text-sm">
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
        <Card className="border-t-4 border-t-purple-500">
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
                    className="bg-muted p-3 rounded text-sm font-mono text-muted-foreground relative group cursor-pointer hover:bg-muted/80 transition-colors"
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
                <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border whitespace-pre-wrap">
                  {analysis.action_plan.followup_strategy}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader>
            <CardTitle>{t("report.actionPlan.knowledgeGaps")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {(analysis.action_plan?.knowledge_gap ?? []).length ? (
                analysis.action_plan!.knowledge_gap!.slice(0, 12).map((g, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">
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

function QAList({
  items,
}: {
  items: Array<{
    question?: string;
    answer?: string;
    feedback?: string;
    score?: number;
    improvement?: { diagnosis?: string; star_plan?: string };
  }>;
}) {
  const { t, language } = useLanguage();

  if (!items.length) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {language === "zh" ? "暂无该分类问答解析。" : "No Q&A items in this category."}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {items.slice(0, 12).map((it, idx) => {
        const score = clampScore(it.score);
        const label =
          score >= 80 ? t("report.qaItems.excellent") : t("report.qaItems.needsWork");
        const badgeClass =
          score >= 80 ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600";

        return (
          <div key={idx} className="p-6 hover:bg-muted/10 transition-colors">
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="outline" className="font-mono text-muted-foreground">
                  Q{idx + 1}
                </Badge>
                <h3 className="font-medium text-lg truncate">{it.question || "-"}</h3>
              </div>
              <Badge className={badgeClass}>
                {label} ({score}/100)
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  {t("report.qaItems.summary")}
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border leading-relaxed whitespace-pre-wrap">
                  {it.answer || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> {t("report.qaItems.coaching")}
                </h4>
                <div className="bg-primary/5 border border-primary/10 p-4 rounded-md space-y-3">
                  <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                    {it.feedback || "-"}
                  </p>

                  {(it.improvement?.diagnosis || it.improvement?.star_plan) ? (
                    <div className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/30 space-y-2">
                      {it.improvement?.diagnosis ? (
                        <div>
                          <strong>{language === "zh" ? "诊断：" : "Diagnosis: "}</strong>
                          <span className="whitespace-pre-wrap">{it.improvement.diagnosis}</span>
                        </div>
                      ) : null}
                      {it.improvement?.star_plan ? (
                        <div>
                          <strong>{language === "zh" ? "STAR 改写：" : "STAR rewrite: "}</strong>
                          <span className="whitespace-pre-wrap">{it.improvement.star_plan}</span>
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
