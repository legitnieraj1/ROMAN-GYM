"use client";

import { SmoothScroll }          from "./SmoothScroll";
import { PageIntro }             from "./PageIntro";
import { HeroSection }           from "./HeroSection";
import { ManifestoSection }      from "./ManifestoSection";
import { GallerySection }        from "./GallerySection";
import { FeaturesSection }       from "./FeaturesSection";
import { TransformationSection } from "./TransformationSection";
import { MembershipSection }     from "./MembershipSection";
import { TrainersSection }       from "./TrainersSection";
import { CTASection }            from "./CTASection";

/**
 * Page narrative:
 * 1. Hero — gym photo + bold headline
 * 2. Manifesto — stats strip + "NOT A GYM"
 * 3. Gallery — all 14 gym photos in editorial grid
 * 4. Features — what we offer
 * 5. Transformations — proof
 * 6. Membership — pricing
 * 7. Trainers — the team
 * 8. CTA — final call
 */
export function LandingPage() {
  return (
    <>
      <PageIntro />
      <SmoothScroll>
        <HeroSection />
        <ManifestoSection />
        <GallerySection />
        <FeaturesSection />
        <TransformationSection />
        <MembershipSection />
        <TrainersSection />
        <CTASection />
      </SmoothScroll>
    </>
  );
}
