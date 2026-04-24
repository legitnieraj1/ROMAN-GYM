"use client";

import { SmoothScroll }        from "./SmoothScroll";
import { GrainOverlay }        from "./GrainOverlay";
import { CustomCursor }        from "./CustomCursor";
import { PageIntro }           from "./PageIntro";
import { HeroSection }         from "./HeroSection";
import { ManifestoSection }    from "./ManifestoSection";
import { EmpireSection }       from "./EmpireSection";
import { FeaturesSection }     from "./FeaturesSection";
import { TransformationSection } from "./TransformationSection";
import { MembershipSection }   from "./MembershipSection";
import { MontageSection }      from "./MontageSection";
import { TrainersSection }     from "./TrainersSection";
import { CTASection }          from "./CTASection";

/**
 * Narrative order:
 * 1. "BUILT DIFFERENT."              — Hero makes the claim
 * 2. "THIS IS NOT A GYM. IT'S YOUR FORGE." — Manifesto drives it home
 * 3. "ENTER THE ROMAN EMPIRE"        — Context + stats
 * 4. GYM FEATURES                    — Editorial what-you-get
 * 5. BODY TRANSFORMATION             — Proof (before/after)
 * 6. MEMBERSHIP PLANS                — Offer
 * 7. POWER · DISCIPLINE · LEGACY     — Emotional montage
 * 8. ELITE TRAINERS                  — The people
 * 9. JOIN.                           — Final call to action
 */
export function LandingPage() {
  return (
    <>
      {/* ── Fixed overlays ── */}
      <PageIntro />
      <CustomCursor />
      <GrainOverlay />

      {/* ── Scrollable content ── */}
      <SmoothScroll>
        <HeroSection />
        <ManifestoSection />
        <EmpireSection />
        <FeaturesSection />
        <TransformationSection />
        <MembershipSection />
        <MontageSection />
        <TrainersSection />
        <CTASection />
      </SmoothScroll>
    </>
  );
}
