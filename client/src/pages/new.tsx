import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Sparkles, FileType, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";

export default function NewReviewPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");

  const handleAnalyze = () => {
    if (!jdText || !resumeText || !transcriptText) {
      toast({
        title: t("new.errorMissing"),
        description: t("new.errorDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setLocation("/report/mock-123");
    }, 3000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("new.title")}</h1>
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
        />
        <InputCard 
          title={t("new.resume")} 
          icon={<FileType className="w-5 h-5 text-emerald-500" />}
          description={t("new.uploadResume")}
          placeholder={t("new.placeholderResume")}
          value={resumeText}
          onChange={setResumeText}
          uploadLabel={t("new.uploadResume")}
        />
        <InputCard 
          title={t("new.transcript")} 
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          description={t("new.uploadTranscript")}
          placeholder={t("new.placeholderTranscript")}
          value={transcriptText}
          onChange={setTranscriptText}
          uploadLabel={t("new.uploadTranscript")}
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

function InputCard({ 
  title, 
  icon, 
  description, 
  placeholder, 
  value, 
  onChange,
  uploadLabel
}: { 
  title: string, 
  icon: React.ReactNode, 
  description: string, 
  placeholder: string,
  value: string,
  onChange: (val: string) => void,
  uploadLabel: string
}) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"text" | "file">("text");

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
        <Tabs defaultValue="text" className="w-full flex-1 flex flex-col" onValueChange={(v) => setMode(v as any)}>
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
          
          <TabsContent value="file" className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/10 mt-0 h-full">
            <div className="text-center p-6 space-y-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">{uploadLabel}</h3>
              <p className="text-xs text-muted-foreground">{t("new.dragDrop")}</p>
              <Button variant="outline" size="sm" className="mt-2">{t("new.selectFile")}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-0 pb-4 px-6 flex justify-between items-center text-xs text-muted-foreground">
        <span>{mode === 'text' ? `${value.length} ${t("new.chars")}` : t("new.noFile")}</span>
        {value.length > 50 && <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> {t("new.ready")}</Badge>}
      </CardFooter>
    </Card>
  );
}
