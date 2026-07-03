import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { LoopsSection } from "@/components/landing/LoopsSection";
import { Features } from "@/components/landing/Features";
import { BadgesSection } from "@/components/landing/BadgesSection";
import { ChallengesSection } from "@/components/landing/ChallengesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="relative">
      <LandingNav />
      <main>
        <Hero />
        <LoopsSection />
        <Features />
        <BadgesSection />
        <ChallengesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
