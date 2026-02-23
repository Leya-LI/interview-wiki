import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, FileText, BrainCircuit, BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          {t("nav.title")}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost">{t("nav.signIn")}</Button>
          <Link href="/new">
            <Button>{t("nav.getStarted")}</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 max-w-5xl mx-auto space-y-8">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            {t("landing.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            {t("landing.heroTitle")} <span className="text-primary">{t("landing.heroTitleAccent")}</span>
            {t("landing.heroTitleSuffix") && <span className="block">{t("landing.heroTitleSuffix")}</span>}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("landing.heroDesc")}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <Link href="/new">
            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
              {t("nav.newReview")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base">
            {t("landing.viewSample")}
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("landing.feature1.title")}</h3>
            <p className="text-muted-foreground">
              {t("landing.feature1.desc")}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("landing.feature2.title")}</h3>
            <p className="text-muted-foreground">
              {t("landing.feature2.desc")}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("landing.feature3.title")}</h3>
            <p className="text-muted-foreground">
              {t("landing.feature3.desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>{t("landing.footer")}</p>
      </footer>
    </div>
  );
}
