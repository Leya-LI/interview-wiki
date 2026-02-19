import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PlusCircle, 
  History, 
  Settings, 
  LogOut, 
  FileText
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className, ...props }: SidebarProps) {
  const [location] = useLocation();
  const { t, language } = useLanguage();

  // Mock history data - localized date if needed, but title/score are static
  const historyItems = [
    { id: "1", title: "Senior Frontend - Google", date: language === 'zh' ? "2天前" : "2 days ago", score: 85 },
    { id: "2", title: "Product Manager - Stripe", date: language === 'zh' ? "5天前" : "5 days ago", score: 72 },
    { id: "3", title: "AI Engineer - Anthropic", date: language === 'zh' ? "1周前" : "1 week ago", score: 92 },
  ];

  return (
    <div className={cn("pb-12 h-screen flex flex-col bg-sidebar text-sidebar-foreground", className)} {...props}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <Link href="/">
            <h2 className="mb-6 px-4 text-xl font-bold tracking-tight text-primary flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              {t("nav.title")}
            </h2>
          </Link>
          <div className="space-y-1">
            <Link href="/new">
              <Button 
                variant={location === "/new" ? "secondary" : "ghost"} 
                className="w-full justify-start"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("nav.newReview")}
              </Button>
            </Link>
            <Link href="/history">
              <Button 
                variant={location === "/history" ? "secondary" : "ghost"} 
                className="w-full justify-start"
              >
                <History className="mr-2 h-4 w-4" />
                {t("nav.history")}
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            {t("nav.recent")}
          </h3>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {historyItems.map((item) => (
                <Link key={item.id} href={`/report/${item.id}`}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal h-auto py-2 items-start",
                      location === `/report/${item.id}` && "bg-secondary"
                    )}
                  >
                    <div className="flex flex-col items-start gap-1 w-full truncate">
                      <span className="font-medium truncate w-full">{item.title}</span>
                      <div className="flex justify-between w-full text-xs text-muted-foreground">
                        <span>{item.date}</span>
                        <span className={cn(
                          "font-mono font-bold",
                          item.score >= 80 ? "text-green-600" : 
                          item.score >= 60 ? "text-yellow-600" : "text-red-600"
                        )}>{item.score}</span>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <div className="px-3 py-4 border-t border-sidebar-border mt-auto">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Settings className="mr-2 h-4 w-4" />
            {t("nav.settings")}
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
