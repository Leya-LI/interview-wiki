import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";

export default function HistoryPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("history.title")}</h1>
          <p className="text-muted-foreground">{t("history.desc")}</p>
        </div>
        <Link href="/new">
          <Button>{t("nav.newReview")}</Button>
        </Link>
      </div>
      
      <div className="grid gap-4">
        <div className="p-12 text-center border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">{t("history.empty")}</p>
        </div>
      </div>
    </div>
  );
}
