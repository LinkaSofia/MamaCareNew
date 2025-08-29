import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPWA } from "@/components/InstallPWA";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import ResetPassword from "@/pages/reset-password";
import VerifyReset from "@/pages/verify-reset";
import VerifyToken from "@/pages/verify-token";
import Dashboard from "@/pages/dashboard";
import PregnancySetup from "@/pages/pregnancy-setup";
import Setup from "@/pages/setup";
import KickCounter from "@/pages/kick-counter";
import WeightTracking from "@/pages/weight-tracking";
import BirthPlan from "@/pages/birth-plan";
import BabyDevelopment from "@/pages/baby-development";
import Consultations from "@/pages/consultations";
import ShoppingList from "@/pages/shopping-list";
import PhotoAlbum from "@/pages/photo-album";
import Diary from "@/pages/diary";
import Exercises from "@/pages/exercises";
import Recipes from "@/pages/recipes";
import Symptoms from "@/pages/symptoms";
import Medications from "@/pages/medications";
import Community from "@/pages/community";
import Profile from "@/pages/profile";
import { AuthProvider } from "@/hooks/useAuth";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-reset" component={VerifyReset} />
      <Route path="/verify-token" component={VerifyToken} />
      <Route path="/" component={Dashboard} />
      <Route path="/pregnancy-setup" component={PregnancySetup} />
      <Route path="/setup" component={Setup} />
      <Route path="/kick-counter" component={KickCounter} />
      <Route path="/weight-tracking" component={WeightTracking} />
      <Route path="/birth-plan" component={BirthPlan} />
      <Route path="/baby-development" component={BabyDevelopment} />
      <Route path="/consultations" component={Consultations} />
      <Route path="/shopping-list" component={ShoppingList} />
      <Route path="/photo-album" component={PhotoAlbum} />
      <Route path="/diary" component={Diary} />
      <Route path="/exercises" component={Exercises} />
      <Route path="/recipes" component={Recipes} />
      <Route path="/symptoms" component={Symptoms} />
      <Route path="/medications" component={Medications} />
      <Route path="/community" component={Community} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <InstallPWA />
          <div className="App">
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;