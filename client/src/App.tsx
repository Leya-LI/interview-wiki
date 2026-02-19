import { useLocation, Link, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import NewReviewPage from "@/pages/new";
import ReportPage from "@/pages/report";
import HistoryPage from "@/pages/history";
import Sidebar from "@/components/layout/sidebar";
import { LanguageProvider, useLanguage } from "./lib/language-context";

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="fixed top-4 right-4 z-[60] flex gap-1 bg-background/80 backdrop-blur border rounded-full p-1 shadow-sm">
      <button 
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
      >
        EN
      </button>
      <button 
        onClick={() => setLanguage("zh")}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${language === 'zh' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
      >
        中文
      </button>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const showSidebar = location !== "/";

  return (
    <div className="flex min-h-screen bg-background w-full">
      {showSidebar && <Sidebar className="w-64 flex-shrink-0 hidden md:block border-r" />}
      <main className="flex-1 flex flex-col min-h-0 overflow-auto relative">
        <LanguageToggle />
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/new" component={NewReviewPage} />
          <Route path="/report/:id" component={ReportPage} />
          <Route path="/history" component={HistoryPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
