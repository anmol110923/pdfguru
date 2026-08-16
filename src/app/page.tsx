import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Hero } from "@/components/landing/Hero";
import { PrivacyBanner } from "@/components/landing/PrivacyBanner";
import { WorkflowSteps } from "@/components/landing/WorkflowSteps";
import { Navbar } from "@/components/layout/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main>
        <Hero />
        <WorkflowSteps />
        <FeatureGrid />
        <PrivacyBanner />
      </main>
    </div>
  );
}
