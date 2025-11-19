import { Toaster as SonnerToaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useMedicationReminders } from "@/hooks/useMedicationReminders";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Rituals = lazy(() => import("./pages/Rituals"));
const MorningCheckin = lazy(() => import("./pages/MorningCheckin"));
const EveningCheckin = lazy(() => import("./pages/EveningCheckin"));
const Insights = lazy(() => import("./pages/Insights"));
const Family = lazy(() => import("./pages/Family"));
const AICoach = lazy(() => import("./pages/AICoach"));
const Medications = lazy(() => import("./pages/Medications"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showBottomNav = location.pathname.startsWith("/app/");

  // Enable medication reminders
  useMedicationReminders();

  // App routes for swipe navigation
  const appRoutes = [
    "/app/home",
    "/app/checkin",
    "/app/insights",
    "/app/family",
    "/app/coach",
  ];

  const currentIndex = appRoutes.indexOf(location.pathname);

  // Enable swipe navigation on app routes
  useSwipeNavigation({
    onSwipeLeft: () => {
      if (currentIndex >= 0 && currentIndex < appRoutes.length - 1) {
        navigate(appRoutes[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        navigate(appRoutes[currentIndex - 1]);
      }
    },
    threshold: 100,
  });

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app/home" element={<Dashboard />} />
            <Route path="/app/checkin" element={<Rituals />} />
            <Route path="/app/checkin/morning" element={<MorningCheckin />} />
            <Route path="/app/checkin/evening" element={<EveningCheckin />} />
            <Route path="/app/insights" element={<Insights />} />
            <Route path="/app/family" element={<Family />} />
            <Route path="/app/coach" element={<AICoach />} />
            <Route path="/app/medications" element={<Medications />} />
            <Route path="/app/achievements" element={<Achievements />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </Suspense>
      {showBottomNav && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <SonnerToaster />
          <PWAInstallPrompt />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AccessibilityProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
