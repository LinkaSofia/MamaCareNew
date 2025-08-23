import { useLocation } from "wouter";
import PregnancyTracker from "@/components/pregnancy-tracker";
import BottomNavigation from "@/components/layout/bottom-navigation";

export default function BabyDevelopment() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <PregnancyTracker onBack={() => setLocation("/")} />
      <BottomNavigation />
    </div>
  );
}
