import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionDraftProvider } from "@/lib/sessionStore";
import { AuthProvider } from "@/lib/authStore";

import Welcome from "@/pages/Welcome";
import Expectations from "@/pages/Expectations";
import Grounding from "@/pages/Grounding";
import PromptFeeling from "@/pages/PromptFeeling";
import PromptBody from "@/pages/PromptBody";
import PromptHardest from "@/pages/PromptHardest";
import Integration from "@/pages/Integration";
import Completion from "@/pages/Completion";
import Signup from "@/pages/Signup";
import AuthCallback from "@/pages/AuthCallback";
import Archive from "@/pages/Archive";
import SessionDetail from "@/pages/SessionDetail";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/begin" component={Expectations} />
      <Route path="/ground" component={Grounding} />
      <Route path="/feeling" component={PromptFeeling} />
      <Route path="/body" component={PromptBody} />
      <Route path="/hardest" component={PromptHardest} />
      <Route path="/integration" component={Integration} />
      <Route path="/complete" component={Completion} />
      <Route path="/signup" component={Signup} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/archive" component={Archive} />
      <Route path="/session/:id" component={SessionDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SessionDraftProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          </SessionDraftProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
