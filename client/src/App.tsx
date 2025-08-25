import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

// Import das páginas essenciais
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import PregnancySetup from "@/pages/pregnancy-setup";
import Setup from "@/pages/setup";
import ResetPassword from "@/pages/reset-password";
import Profile from "@/pages/profile";

// Import das páginas principais
import KickCounter from "@/pages/kick-counter";
import WeightTracking from "@/pages/weight-tracking";
import Consultations from "@/pages/consultations";
import ShoppingList from "@/pages/shopping-list";
import PhotoAlbum from "@/pages/photo-album";
import Diary from "@/pages/diary";
import BirthPlan from "@/pages/birth-plan";
import Exercises from "@/pages/exercises";
import Recipes from "@/pages/recipes";

// Import dos componentes que vou criar
import BabyDevelopment from "@/pages/baby-development";
import { Progress } from "@/pages/progress";
import Symptoms from "@/pages/symptoms";
import Medications from "@/pages/medications";
import Community from "@/pages/community";
import { MobileMenu } from "@/components/Navigation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Páginas sem layout */}
        <Route path="/login" component={Login} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/forgot-password" component={ResetPassword} />
        <Route path="/pregnancy-setup" component={PregnancySetup} />
        <Route path="/setup" component={Setup} />
        
        {/* Páginas principais com layout */}
        <Route path="/" component={Dashboard} />
        <Route path="/baby-development" component={BabyDevelopment} />
        <Route path="/kick-counter" component={KickCounter} />
        <Route path="/weight-tracking" component={WeightTracking} />
        <Route path="/progress" component={Progress} />
        <Route path="/consultations" component={Consultations} />
        <Route path="/shopping-list" component={ShoppingList} />
        <Route path="/photo-album" component={PhotoAlbum} />
        <Route path="/diary" component={Diary} />
        <Route path="/birth-plan" component={BirthPlan} />
        <Route path="/exercises" component={Exercises} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/symptoms" component={Symptoms} />
        <Route path="/medications" component={Medications} />
        <Route path="/community" component={Community} />
        <Route path="/profile" component={Profile} />
        <Route path="/menu" component={MobileMenu} />
        
        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="App">
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;