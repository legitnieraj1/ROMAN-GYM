"use client";

import { SmoothScroll } from "./SmoothScroll";
import { HeroSection } from "./HeroSection";
import { EmpireSection } from "./EmpireSection";
import { FeaturesSection } from "./FeaturesSection";
import { TransformationSection } from "./TransformationSection";
import { MembershipSection } from "./MembershipSection";
import { MontageSection } from "./MontageSection";
import { TrainersSection } from "./TrainersSection";
import { CTASection } from "./CTASection";

export function LandingPage() {
  return (
    <SmoothScroll>
      <HeroSection />
      <EmpireSection />
      <FeaturesSection />
      <TransformationSection />
      <MembershipSection />
      <MontageSection />
      <TrainersSection />
      <CTASection />
    </SmoothScroll>
  );
}
