// client/src/pages/new.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  FileText,
  Upload,
  Sparkles,
  FileType,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/lib/supabase";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export default function NewReviewPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");

  const [jdPdfUrl, setJdPdfUrl] = useState("");
  const [resumePdfUrl, setResumePdfUrl] = useState("");
  const [transcriptPdfUrl, setTranscriptPdfUrl] = useState("");

  const handleAnalyze = async () => {
    const hasJd = jdText.trim() || jdPdfUrl;
    const hasResume = resumeText.trim() || resumePdfUrl;
    const hasTranscript = transcriptText.trim() || transcriptPdfUrl;

    if (!hasJd || !hasResume || !hasTranscript) {
      toast({
        title: t("new.errorMissing"),
        description: t("new.errorDesc"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText,
          resumeText,
          transcriptText,
          jdPdfUrl,
          resumePdfUrl,
          transcriptPdfUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorCode || "UNKNOWN_ERROR");
      }

      localStorage.setItem("latestReport", JSON.stringify(data.analysis));
      setLocation("/report/result");
    } catch {
      toast({
        title: t("error.generateFailed"),
        description: t("error.serverError"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {t("new.title")}
        </h1>
        <p className="text-muted-foreground">{t("new.desc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InputCard
          title={t("new.jd")}
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          description={t("new.uploadJD")}
          placeholder={t("new.placeholderJD")}
          value={jdText}
          onChange={setJdText}
          uploadLabel={t("new.uploadJD")}
          onFileUrlChange={setJdPdfUrl}
        />
        <InputCard
          title={t("new.resume")}
          icon={<FileType className="w-5 h-5 text-emerald-500" />}
          description={t("new.uploadResume")}
          placeholder={t("new.placeholderResume")}
          value={resumeText}
          onChange={setResumeText}
          uploadLabel={t("new.uploadResume")}
          onFileUrlChange={setResumePdfUrl}
        />
        <InputCard
          title={t("new.transcript")}
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          description={t("new.uploadTranscript")}
          placeholder={t("new.placeholderTranscript")}
          value={transcriptText}
          onChange={setTranscriptText}
          uploadLabel={t("new.uploadTranscript")}
          onFileUrlChange={setTranscriptPdfUrl}
        />
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <Button size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? t("new.analyzing") : t("new.generate")}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t("new.estTime")}
        </p>
      </div>
    </div>
  );
}
