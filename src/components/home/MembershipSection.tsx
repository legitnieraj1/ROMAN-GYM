"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, X, Crown, Star, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: "Basic",
    icon: Zap,
    price: "3,099",
    period: "3 Months",
    bonus: "3 + 3 Months",
    features: [
      { text: "Full Gym Access",   included: true  },
      { text: "All Equipment",     included: true  },
      { text: "Locker Access",     included: true  },
      { text: "Cardio Zone",       included: true  },
      { text: "Personal Training", included: false },
      { text: "Diet Plan",         included: false },
    ],
    featured: false,
  },
  {
    name: "Pro",
    icon: Star,
    price: "4,699",
    period: "6 Months",
    bonus: "6 + 6 Months",
    features: [
      { text: "Full Gym Access",     included: true },
      { text: "All Equipment",       included: true },
      { text: "Locker Access",       included: true },
      { text: "Cardio Zone",         included: true },
      { text: "Basic Diet Guidance", included: true },
      { text: "Progress Tracking",   included: true },
    ],
    featured: true,
  },
  {
    name: "Elite",
    icon: Crown,
    price: "6,699",
    period: "1 Year",
    bonus: "1 + 1 Year",
    features: [
      { text: "Full Gym Access",   included: true },
      { text: "All Equipment",     included: true },
      { text: "Locker Access",     included: true },
      { text: "Cardio Zone",       included: true },
      { text: "Personal Training", included: true },
      { text: "AI Diet Plan",      included: true },
    ],
    featured: false,
  },
];

function PlanCard({
  plan,
  onSubscribe,
  loadingPlan,
}: {
  plan: typeof plans[0];
  onSubscribe: (planName: string) => void;
  loadingPlan: string | null;
}) {
  const Icon = plan.icon;
  const isLoading = loadingPlan === plan.name;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x  = e.clientX - rect.left;
    const y  = e.clientY - rect.top;
    const cx = rect.width  / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -5;
    const rotY = ((x - cx) / cx) *  5;
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(14px) translateY(-10px)`;
    el.style.transition = "transform 0.1s linear";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform =
      "perspective(900px) rotateX(0) rotateY(0) translateZ(0) translateY(0)";
    e.currentTarget.style.transition = "transform 0.7s cubic-bezier(0.23,1,0.32,1)";
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col p-6 md:p-8 h-full cursor-pointer ${
        plan.featured
          ? "bg-[#0f0303] border-pulse-red"
          : "bg-[#111]/60 border border-white/[0.06]"
      }`}
      style={{
        transformStyle: "preserve-3d",
        ...(plan.featured
          ? { boxShadow: "0 0 0 1px rgba(232,25,43,0.4), 0 0 50px rgba(232,25,43,0.12)" }
          : {}),
      }}
    >
      {/* Most Popular badge */}
      {plan.featured && (
        <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 px-5 py-1 bg-[#E8192B] text-white text-[10px] font-bold uppercase tracking-[0.25em] whitespace-nowrap">
          Most Popular
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 flex items-center justify-center ${
            plan.featured ? "bg-[#E8192B]/20" : "bg-white/[0.05]"
          }`}
        >
          <Icon className={`w-5 h-5 ${plan.featured ? "text-[#E8192B]" : "text-white/40"}`} />
        </div>
        <div>
          <h3 className="font-heading text-2xl tracking-wider text-white">{plan.name}</h3>
          <p className={`text-[10px] tracking-wider ${plan.featured ? "text-[#E8192B]/70" : "text-white/30"}`}>
            {plan.bonus}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-7">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-white/35">₹</span>
          <span
            className={`font-heading text-4xl md:text-5xl tracking-wider ${
              plan.featured ? "text-[#E8192B]" : "text-white"
            }`}
            style={plan.featured ? { textShadow: "0 0 30px rgba(232,25,43,0.35)" } : {}}
          >
            {plan.price}
          </span>
        </div>
        <p className="text-white/30 text-xs mt-1 tracking-wider">{plan.period}</p>
      </div>

      {/* Features list */}
      <div className="space-y-3 mb-7 flex-1">
        {plan.features.map((feature) => (
          <div key={feature.text} className="flex items-center gap-3">
            {feature.included ? (
              <Check className={`w-4 h-4 flex-shrink-0 ${plan.featured ? "text-[#E8192B]" : "text-white/50"}`} />
            ) : (
              <X className="w-4 h-4 text-white/15 flex-shrink-0" />
            )}
            <span className={`text-sm ${feature.included ? "text-white/65" : "text-white/20"}`}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <button
        onClick={() => onSubscribe(plan.name)}
        disabled={isLoading}
        className={`group/btn relative w-full py-3.5 font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 disabled:opacity-50 overflow-hidden ${
          plan.featured
            ? "bg-[#E8192B] text-white hover:shadow-[0_0_30px_rgba(232,25,43,0.5)] hover:scale-[1.02]"
            : "border border-white/10 text-white/60 hover:text-white hover:border-[#E8192B]/50 hover:bg-[#E8192B]/08"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          <span className="relative z-10">Choose {plan.name}</span>
        )}
        {plan.featured && (
          <div className="absolute inset-0 bg-white/10 translate-x-[-110%] group-hover/btn:translate-x-[110%] transition-transform duration-500 skew-x-[-20deg]" />
        )}
      </button>

      {/* Hover glow overlay */}
      {!plan.featured && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: "0 0 0 1px rgba(232,25,43,0.25), inset 0 0 30px rgba(232,25,43,0.04)" }}
        />
      )}
    </div>
  );
}

function MobileCarousel({
  onSubscribe,
  loadingPlan,
}: {
  onSubscribe: (planName: string) => void;
  loadingPlan: string | null;
}) {
  const [active, setActive]             = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX   = useRef(0);

  const next = useCallback(() => setActive((p) => (p + 1) % plans.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + plans.length) % plans.length), []);

  useEffect(() => {
    if (isAutoPlaying) intervalRef.current = setInterval(next, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoPlaying, next]);

  const pauseAuto = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove  = (e: React.TouchEvent) => { touchEndX.current   = e.touches[0].clientX; };
  const handleTouchEnd   = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { pauseAuto(); diff > 0 ? next() : prev(); }
  };

  const getStyle = (index: number): React.CSSProperties => {
    const diff = ((index - active) + plans.length) % plans.length;
    if (diff === 0) return { transform: "translateX(0) scale(1) rotateY(0deg)",       zIndex: 10, opacity: 1 };
    if (diff === 1) return { transform: "translateX(70%) scale(0.8) rotateY(-25deg)", zIndex: 5,  opacity: 0.4 };
    return              { transform: "translateX(-70%) scale(0.8) rotateY(25deg)",    zIndex: 5,  opacity: 0.4 };
  };

  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <div
        className="relative h-[480px] flex items-center justify-center overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {plans.map((plan, index) => (
          <div
            key={index}
            className="absolute w-[80%] max-w-[300px] transition-all duration-500 ease-out"
            style={{ ...getStyle(index), transformStyle: "preserve-3d" }}
            onClick={() => { pauseAuto(); setActive(index); }}
          >
            <PlanCard plan={plan} onSubscribe={onSubscribe} loadingPlan={loadingPlan} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {plans.map((_, i) => (
          <button
            key={i}
            onClick={() => { pauseAuto(); setActive(i); }}
            className={`h-[3px] rounded-none transition-all duration-300 ${i === active ? "bg-[#E8192B] w-8" : "bg-white/20 w-3"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function MembershipSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement[]>([]);
  const [isMobile, setIsMobile]   = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSubscribe = async (planName: string) => {
    try {
      setLoadingPlan(planName);
      const sessionRes = await fetch("/api/auth/session");
      const session    = await sessionRes.json();
      if (!session?.userId) { router.push("/login"); return; }

      const res  = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const options = {
        key:         data.key,
        amount:      data.amount,
        currency:    data.currency,
        name:        "Roman Fitness",
        description: `${planName.toUpperCase()} Membership`,
        order_id:    data.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes  = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId:   response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan:      planName.toUpperCase(),
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) router.push("/dashboard");
            else alert("Payment verification failed: " + verifyData.message);
          } catch { alert("Payment verification error"); }
        },
        prefill: { name: session.name || "", contact: session.mobile || session.phone || "" },
        theme: { color: "#E8192B" },
      };
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      alert(error.message);
      if (error.message === "Unauthorized") router.push("/login");
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".membership-heading",
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", toggleActions: "play none none reverse" },
        }
      );
      if (!isMobile) {
        cardsRef.current.forEach((card, index) => {
          if (!card) return;
          gsap.fromTo(card, { opacity: 0, y: 70, scale: 0.95 }, {
            opacity: 1, y: 0, scale: 1, duration: 0.85, delay: index * 0.15, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none reverse" },
          });
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section ref={sectionRef} id="plans" className="relative py-16 md:py-28 px-4 bg-[#0A0A0A]">
      {/* Ambient red glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(232,25,43,0.05) 0%, transparent 55%)" }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="membership-heading text-center mb-10 md:mb-14">
          <p className="text-[#E8192B] text-xs tracking-[0.45em] uppercase mb-4 font-medium">Pricing</p>
          <h2 className="font-heading text-4xl md:text-6xl tracking-wider">
            MEMBERSHIP <span className="text-[#E8192B]" style={{ textShadow: "0 0 40px rgba(232,25,43,0.25)" }}>PLANS</span>
          </h2>
          <p className="mt-4 text-white/30 text-sm tracking-wider">No admission fee. Just results.</p>
        </div>

        {isMobile ? (
          <MobileCarousel onSubscribe={handleSubscribe} loadingPlan={loadingPlan} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/[0.04] items-stretch">
            {plans.map((plan, index) => (
              <div key={plan.name} ref={(el) => { if (el) cardsRef.current[index] = el; }}>
                <PlanCard plan={plan} onSubscribe={handleSubscribe} loadingPlan={loadingPlan} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
