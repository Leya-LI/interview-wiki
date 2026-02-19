import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Calendar, 
  User, 
  Trophy, 
  Download, 
  Share2, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useLanguage } from "@/lib/language-context";

export default function ReportPage() {
  const { id } = useParams();
  const { t, language } = useLanguage();

  const basicInfo = {
    company: "TechFlow Inc.",
    position: "Senior Frontend Engineer",
    round: language === 'zh' ? "系统设计与文化匹配" : "System Design & Culture Fit",
    interviewer: language === 'zh' ? "Sarah Chen (工程副总裁)" : "Sarah Chen (VP Engineering)",
    date: "2026-02-18",
    score: 78,
    prediction: language === 'zh' ? "极具潜力" : "High Potential",
    successRate: "75%"
  };

  const radarData = [
    { subject: language === 'zh' ? '技术深度' : 'Technical Depth', A: 85, fullMark: 100 },
    { subject: language === 'zh' ? '沟通能力' : 'Communication', A: 70, fullMark: 100 },
    { subject: language === 'zh' ? '问题解决' : 'Problem Solving', A: 90, fullMark: 100 },
    { subject: language === 'zh' ? '文化契合' : 'Culture Fit', A: 65, fullMark: 100 },
    { subject: language === 'zh' ? '领导力' : 'Leadership', A: 60, fullMark: 100 },
    { subject: language === 'zh' ? '系统设计' : 'System Design', A: 80, fullMark: 100 },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{t("report.id")}: {id}</span>
            <span>•</span>
            <span>{basicInfo.date}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {basicInfo.position} at {basicInfo.company}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> {t("report.export")}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> {t("report.share")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>{t("report.context")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("report.company")}</span>
                <div className="flex items-center gap-2 font-medium">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  {basicInfo.company}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("report.round")}</span>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {basicInfo.round}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("report.interviewer")}</span>
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {basicInfo.interviewer}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("report.prediction")}</span>
                <div className="flex items-center gap-2 font-bold text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  {basicInfo.prediction} ({basicInfo.successRate})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("report.overallScore")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-6xl font-bold text-primary tabular-nums tracking-tighter">
              {basicInfo.score}
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className={`w-2 h-2 rounded-full ${star <= 4 ? 'bg-primary' : 'bg-primary/20'}`} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
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
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 text-sm">Strong Match: React Ecosystem</h4>
                  <p className="text-sm text-green-800/80 mt-1">
                    Your experience with Next.js App Router perfectly aligns with the team's current migration plans.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900 text-sm">Gap: Team Leadership</h4>
                  <p className="text-sm text-yellow-800/80 mt-1">
                    JD asks for "mentoring junior devs", but your answers focused mostly on individual contribution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Trophy className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Unique Value: Performance Opt.</h4>
                  <p className="text-sm text-blue-800/80 mt-1">
                    Your detailed example of reducing LCP by 40% was a highlight not explicitly requested but highly valued.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <TabsTrigger value="technical">{t("report.tabs.technical")}</TabsTrigger>
                <TabsTrigger value="behavioral">{t("report.tabs.behavioral")}</TabsTrigger>
                <TabsTrigger value="reverse">{t("report.tabs.reverse")}</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="experience" className="m-0">
              <div className="divide-y">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-muted-foreground">Q{i}</Badge>
                        <h3 className="font-medium text-lg">
                          {i === 1 ? (language === 'zh' ? "请谈谈你最近领导的一个具有挑战性的项目。" : "Tell me about a challenging project you led recently.") : (language === 'zh' ? "你如何处理与产品经理的分歧？" : "How do you handle disagreements with product managers?")}
                        </h3>
                      </div>
                      <Badge className={i === 1 ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600"}>
                        {i === 1 ? `${t("report.qaItems.excellent")} (92/100)` : `${t("report.qaItems.needsWork")} (65/100)`}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t("report.qaItems.summary")}</h4>
                        <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border leading-relaxed">
                          {i === 1 
                            ? (language === 'zh' ? "你讨论了电商迁移项目，重点介绍了技术栈选择（Next.js vs Remix）和数据库模式迁移的挑战。" : "You discussed the e-commerce migration project. You focused heavily on the technical stack choices (Next.js vs Remix) and the database schema migration challenges.")
                            : (language === 'zh' ? "你提到你通常会尝试折中并寻找中间立场，并举了一个为了赶进度而同意削减功能的例子。" : "You mentioned that you usually try to compromise and find a middle ground, citing an example where you agreed to cut a feature to meet a deadline.")}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> {t("report.qaItems.coaching")}
                        </h4>
                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-md space-y-3">
                          <p className="text-sm font-medium text-foreground">
                            {i === 1 
                              ? (language === 'zh' ? "很好地运用了 STAR 原则。但是，你漏掉了量化业务影响。" : "Great use of the STAR method. However, you missed quantifying the business impact.")
                              : (language === 'zh' ? "这个回答显得有些被动。这表明你可能会回避冲突，而不是进行健康的辩论。" : "This answer felt passive. It suggests you might avoid conflict rather than engaging in healthy debate.")}
                          </p>
                          <div className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/30">
                            <strong>{t("report.qaItems.tryAdding")} </strong>
                            {i === 1 
                              ? (language === 'zh' ? "“这次迁移使转化率提高了 15%...”" : "\"This migration resulted in a 15% increase in conversion rate...\"")
                              : (language === 'zh' ? "“我专注于以数据为导向的讨论。我带来了用户分析，以说明为什么功能 X 是关键的...”" : "\"I focus on data-driven discussions. I brought user analytics to show why Feature X was critical...\"")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <CardTitle>{t("report.actionPlan.resumeTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t("report.actionPlan.resumeBullets")}</h4>
              <div className="bg-muted p-3 rounded text-sm font-mono text-muted-foreground relative group cursor-pointer hover:bg-muted/80 transition-colors">
                <span className="absolute top-2 right-2 text-xs bg-background border px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{t("report.actionPlan.copy")}</span>
                {language === 'zh' ? "“主导了高流量仪表板的 Next.js 迁移，将包大小减少了 30%，并将核心网页指标提升至全绿状态。”" : "\"Spearheaded Next.js migration for high-traffic dashboard, reducing bundle size by 30% and improving Core Web Vitals to all-green.\""}
              </div>
              <div className="bg-muted p-3 rounded text-sm font-mono text-muted-foreground relative group cursor-pointer hover:bg-muted/80 transition-colors">
                <span className="absolute top-2 right-2 text-xs bg-background border px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{t("report.actionPlan.copy")}</span>
                {language === 'zh' ? "“通过每周的代码审查和架构规划会议，指导了 3 名初级开发人员。”" : "\"Mentored 3 junior developers through weekly code reviews and architectural planning sessions.\""}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardHeader>
            <CardTitle>{t("report.actionPlan.knowledgeGaps")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm">{language === 'zh' ? "系统设计：速率限制" : "System Design: Rate Limiting"}</Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">{language === 'zh' ? "React 19 Actions 特性" : "React 19 Actions"}</Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">{language === 'zh' ? "行为面试：冲突解决" : "Behavioral: Conflict Resolution"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{t("report.actionPlan.focusAreas")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
