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
    bonus: "3+3 Months",
    features: [
      { text: "Full Gym Access", included: true },
      { text: "All Equipment", included: true },
      { text: "Locker Access", included: true },
      { text: "Cardio Zone", included: true },
      { text: "Personal Training", included: false },
      { text: "Diet Plan", included: false },
    ],
    featured: false,
  },
  {
    name: "Pro",
    icon: Star,
    price: "4,699",
    period: "6 Months",
    bonus: "6+6 Months",
    features: [
      { text: "Full Gym Access", included: true },
      { text: "All Equipment", included: true },
      { text: "Locker Access", included: true },
      { text: "Cardio Zone", included: true },
      { text: "Basic Diet Guidance", included: true },
      { text: "Progress Tracking", included: true },
    ],
    featured: true,
  },
  {
    name: "Elite",
    icon: Crown,
    price: "6,699",
    period: "1 Year",
    bonus: "1+1 Year",
    features: [
      { text: "Full Gym Access", included: true },
      { text: "All Equipment", included: true },
      { text: "Locker Access", included: true },
      { text: "Cardio Zone", included: true },
      { text: "Personal Training", included: true },
      { text: "AI Diet Plan", included: true },
    ],
    featured: false,
  },
];

function PlanCard({ plan, onSubscribe, loadingPlan }: { plan: typeof plans[0]; onSubscribe: (planName: string) => void; loadingPlan: string | null }) {
  const Icon = plan.icon;
  const isLoading = loadingPlan === plan.name;
  return (
    <div
      className={`group relative flex flex-col p-6 md:p-8 rounded-lg transition-all duration-500 hover:-translate-y-2 h-full ${
        plan.featured
          ? "bg-gradient-to-b from-[#071B2A] to-[#0A0A0A] border border-[#00AEEF]/30 shadow-[0_0_30px_rgba(0,174,239,0.1)]"
          : "bg-[#1A1A1A]/50 border border-white/5 hover:border-[#00AEEF]/20"
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00AEEF] text-white text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${plan.featured ? "bg-[#00AEEF]/20" : "bg-white/5"}`}>
          <Icon className={`w-5 h-5 ${plan.featured ? "text-[#00AEEF]" : "text-white/50"}`} />
        </div>
        <div>
          <h3 className="font-heading text-2xl tracking-wider">{plan.name}</h3>
          <p className="text-xs text-[#00AEEF]/60">{plan.bonus}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-white/40">₹</span>
          <span className={`font-heading text-4xl md:text-5xl tracking-wider ${plan.featured ? "text-[#00AEEF]" : "text-white"}`}>
            {plan.price}
          </span>
        </div>
        <p className="text-white/30 text-sm mt-1">{plan.period}</p>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature) => (
          <div key={feature.text} className="flex items-center gap-3">
            {feature.included ? (
              <Check className="w-4 h-4 text-[#00AEEF] flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-white/20 flex-shrink-0" />
            )}
            <span className={`text-sm ${feature.included ? "text-white/70" : "text-white/25"}`}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubscribe(plan.name)}
        disabled={isLoading}
        className={`block w-full text-center py-3 rounded font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50 ${
          plan.featured
            ? "bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white neon-pulse"
            : "border border-white/10 hover:border-[#00AEEF]/50 text-white/70 hover:text-white hover:bg-white/5"
        }`}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Choose ${plan.name}`}
      </button>

      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: "0 0 40px rgba(0, 174, 239, 0.08)" }}
      />
    </div>
  );
}

function MobileCarousel({ onSubscribe, loadingPlan }: { onSubscribe: (planName: string) => void; loadingPlan: string | null }) {
  const [active, setActive] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = useCallback(() => setActive((p) => (p + 1) % plans.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + plans.length) % plans.length), []);

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(next, 3500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoPlaying, next]);

  const pauseAuto = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      pauseAuto();
      if (diff > 0) next(); else prev();
    }
  };

  const getStyle = (index: number): React.CSSProperties => {
    const diff = ((index - active) + plans.length) % plans.length;
    if (diff === 0) return { transform: "translateX(0) scale(1) rotateY(0deg)", zIndex: 10, opacity: 1 };
    if (diff === 1) return { transform: "translateX(70%) scale(0.8) rotateY(-25deg)", zIndex: 5, opacity: 0.4 };
    return { transform: "translateX(-70%) scale(0.8) rotateY(25deg)", zIndex: 5, opacity: 0.4 };
  };

  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <div
        className="relative h-[460px] flex items-center justify-center overflow-hidden touch-pan-y"
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
      <div className="flex justify-center items-center gap-4 mt-2">
        <div className="flex gap-2">
          {plans.map((_, i) => (
            <button key={i} onClick={() => { pauseAuto(); setActive(i); }} className={`h-2 rounded-full transition-all duration-300 ${i === active ? "bg-[#00AEEF] w-6" : "bg-white/20 w-2"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MembershipSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [isMobile, setIsMobile] = useState(false);
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

      // Check session from the API instead of relying on a prop
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (!session || !session.userId) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Roman Fitness",
        description: `${planName.toUpperCase()} Membership`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan: planName.toUpperCase(),
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) router.push("/dashboard");
            else alert("Payment verification failed: " + verifyData.message);
          } catch {
            alert("Payment verification error");
          }
        },
        prefill: {
          name: session.name || "",
          contact: session.mobile || session.phone || "",
        },
        theme: { color: "#00AEEF" },
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
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none reverse" },
        }
      );

      if (!isMobile) {
        cardsRef.current.forEach((card, index) => {
          if (!card) return;
          gsap.fromTo(card, { opacity: 0, y: 60 }, {
            opacity: 1, y: 0, duration: 0.8, delay: index * 0.15, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section ref={sectionRef} id="plans" className="relative py-24 md:py-32 px-4 bg-[#0A0A0A]">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00AEEF]/[0.02] rounded-full" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="membership-heading text-center mb-16">
          <p className="text-[#00AEEF] text-sm tracking-[0.3em] uppercase mb-4">Pricing</p>
          <h2 className="font-heading text-4xl md:text-6xl tracking-wider">
            MEMBERSHIP <span className="text-[#00AEEF]">PLANS</span>
          </h2>
        </div>

        {isMobile ? (
          <MobileCarousel onSubscribe={handleSubscribe} loadingPlan={loadingPlan} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
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
