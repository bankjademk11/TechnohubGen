import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import { DonateRobot } from "./components/DonateRobot";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/generator"} component={Generator} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          {/* Main App Container with Background Image */}
          <div 
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: "url('/background.webp')" }}
          >
            {/* Optional overlay to make content more readable */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none z-0" />
            
            <div className="relative z-10 min-h-screen">
              <Toaster />
              <Router />
              <DonateRobot />
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
