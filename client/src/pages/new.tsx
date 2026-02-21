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

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB

type AnalyzeRequestBody = {
  jdText: string;
  resumeText: string;
  transcriptText: string;
  jdPdfUrl: string;
  resumePdfUrl: string;
  transcriptPdfUrl: string;
};

export default function NewReviewPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");

  // ✅ 三份 PDF 上传后的 public URL
  const [jdPdfUrl, setJdPdfUrl] = useState<string>("");
  const [resumePdfUrl, setResumePdfUrl] = useState<string>("");
  const [transcriptPdfUrl, setTranscriptPdfUrl] = useState<string>("");

  const handleAnalyze = async () => {
    const hasJd = jdText.trim().length > 0 || !!jdPdfUrl;
    const hasResume = resumeText.trim().length > 0 || !!resumePdfUrl;
    const hasTranscript =
      transcriptText.trim().length > 0 || !!transcriptPdfUrl;

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

      const payload: AnalyzeRequestBody = {
        jdText,
        resumeText,
        transcriptText,
        jdPdfUrl,
        resumePdfUrl,
        transcriptPdfUrl,
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // 你后端可以统一返回 { errorCode, error }
        // 这里做一个兼容：优先 error / message，否则给通用文案
        const msg =
          data?.error ||
          data?.message ||
          (typeof data?.errorCode === "string" ? data.errorCode : "") ||
          t("error.serverError");
        throw new Error(msg);
      }

      // 暂存结果（你 Report 页面再读取）
      // 这里兼容 data.analysis 或 data
      const analysis = data?.analysis ?? data;
      localStorage.setItem("latestReport", JSON.stringify(analysis));

      // 你现有路由是 /report/:id
      // 先跳一个固定 id（你后续可以改成后端返回 reportId）
      setLocation("/report/result");
    } catch (err: any) {
      toast({
        title: t("error.generateFailed"),
        description: err?.message ?? t("error.unknown"),
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
        <Button
          size="lg"
          className="w-full md:w-auto min-w-[200px] h-14 text-lg shadow-xl shadow-primary/20"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 animate-spin" />
              {t("new.analyzing")}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {t("new.generate")}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">{t("new.estTime")}</p>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-200"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function InputCard({
  title,
  icon,
  description,
  placeholder,
  value,
  onChange,
  uploadLabel,
  onFileUrlChange,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  uploadLabel: string;
  onFileUrlChange: (url: string) => void;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [mode, setMode] = useState<"text" | "file">("text");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");

  const [uploadError, setUploadError] = useState<string>("");

  const [isDragOver, setIsDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const fakeProgressTimerRef = useRef<number | null>(null);

  const stopFakeProgress = () => {
    if (fakeProgressTimerRef.current) {
      window.clearInterval(fakeProgressTimerRef.current);
      fakeProgressTimerRef.current = null;
    }
  };

  const startFakeProgress = () => {
    stopFakeProgress();
    setUploadProgress(0);
    // 假进度：快速到 15%，然后缓慢逼近 90%
    fakeProgressTimerRef.current = window.setInterval(() => {
      setUploadProgress((p) => {
        if (p < 15) return p + 5;
        if (p < 60) return p + 3;
        if (p < 85) return p + 2;
        if (p < 90) return p + 1;
        return p; // 卡在 90 等待真正完成
      });
    }, 180);
  };

  useEffect(() => {
    return () => stopFakeProgress();
  }, []);

  const clearFile = () => {
    stopFakeProgress();
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError("");

    setFileName("");
    setFileSize(0);
    setFileUrl("");
    lastFileRef.current = null;
    onFileUrlChange("");
  };

  const validateFile = (file: File) => {
    if (file.type !== "application/pdf") {
      return t("new.pdfOnly");
    }
    if (file.size > MAX_PDF_BYTES) {
      // 避免拼接中文：用 t + formatBytes
      return `${t("new.fileTooLarge")}（${formatBytes(file.size)}），${t("new.maxSize")}`;
    }
    return "";
  };

  const uploadPdfToSupabase = async (file: File) => {
    // bucket 名：uploads（你已创建）
    const bucket = "uploads";
    const path = `uploads/${crypto.randomUUID()}.pdf`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: "application/pdf", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSelectFile = async (file: File) => {
    lastFileRef.current = file;

    setFileName(file.name);
    setFileSize(file.size);
    setFileUrl("");
    onFileUrlChange("");
    setUploadError("");

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      startFakeProgress();

      const publicUrl = await uploadPdfToSupabase(file);

      stopFakeProgress();
      setUploadProgress(100);

      setFileUrl(publicUrl);
      onFileUrlChange(publicUrl);
      setUploadError("");
    } catch (e: any) {
      stopFakeProgress();
      setUploadProgress(0);

      setFileUrl("");
      onFileUrlChange("");

      setUploadError(e?.message ?? t("error.unknown"));

      toast({
        title: t("error.uploadFailed"),
        description: e?.message ?? t("error.unknown"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const retryUpload = async () => {
    const f = lastFileRef.current;
    if (!f) return;
    await handleSelectFile(f);
  };

  const onDropFile = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const f = e.dataTransfer.files?.[0];
    if (f) await handleSelectFile(f);
  };

  const hasFileCard = !!fileName || !!uploadError || !!fileUrl || isUploading;

  return (
    <Card className="h-full flex flex-col border-t-4 border-t-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-[300px] flex flex-col">
        <Tabs
          defaultValue="text"
          className="w-full flex-1 flex flex-col"
          onValueChange={(v) => setMode(v as any)}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="text">{t("new.pasteText")}</TabsTrigger>
            <TabsTrigger value="file">{t("new.uploadFile")}</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1 flex flex-col mt-0 h-full">
            <Textarea
              placeholder={placeholder}
              className="flex-1 min-h-[200px] resize-none font-mono text-sm bg-muted/30 border-dashed"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </TabsContent>

          <TabsContent
            value="file"
            className="flex-1 flex flex-col border-2 border-dashed rounded-lg bg-muted/10 mt-0 h-full"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
            }}
            onDrop={onDropFile}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleSelectFile(f);
                e.currentTarget.value = "";
              }}
            />

            {!hasFileCard ? (
              <div
                className={`flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 transition-colors ${
                  isDragOver ? "bg-primary/5" : ""
                }`}
              >
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">{uploadLabel}</h3>
                <p className="text-xs text-muted-foreground">
                  {isDragOver ? t("new.dropHere") : `${t("new.dragDrop")}（PDF ≤ 5MB）`}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {t("new.selectFile")}
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div
                  className={`w-full rounded-lg border bg-background shadow-sm p-4 ${
                    isDragOver ? "ring-2 ring-primary/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <p className="font-medium truncate">
                          {fileName || t("new.noFile")}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fileSize ? `${formatBytes(fileSize)} · PDF` : "PDF（≤ 5MB）"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                      onClick={clearFile}
                      disabled={isUploading}
                      title={t("new.removeFile")}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("new.uploading")}</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <ProgressBar value={uploadProgress} />
                    </div>
                  )}

                  {!!uploadError && (
                    <div className="mt-4 text-sm text-red-600">{uploadError}</div>
                  )}

                  <div className="mt-4 flex gap-2 justify-end">
                    <div className="mr-auto text-xs text-muted-foreground">
                      {isDragOver ? t("new.dropHere") : t("new.dropHint")}
                    </div>

                    {!!uploadError && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void retryUpload()}
                        disabled={isUploading || !lastFileRef.current}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t("new.retry")}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => inputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {t("new.reselect")}
                    </Button>

                    {fileUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          window.open(fileUrl, "_blank", "noopener,noreferrer")
                        }
                      >
                        {t("new.view")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-6 flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {mode === "text"
            ? `${value.length} ${t("new.chars")}`
            : fileUrl
              ? t("new.fileOk")
              : uploadError
                ? t("new.fileBad")
                : t("new.noFile")}
        </span>

        {mode === "text" ? (
          value.length > 50 && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 hover:bg-green-100"
            >
              <CheckCircle className="w-3 h-3 mr-1" /> {t("new.ready")}
            </Badge>
          )
        ) : (
          fileUrl && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 hover:bg-green-100"
            >
              <CheckCircle className="w-3 h-3 mr-1" /> {t("new.ready")}
            </Badge>
          )
        )}
      </CardFooter>
    </Card>
  );
}
