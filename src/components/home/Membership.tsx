"use client";

import { motion } from "framer-motion";
import { Check, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

const plans = [
    {
        name: "BASIC",
        price: "₹3,099",
        period: "/ quarter",
        description: "Pay 3 months, get 3 months free. Perfect for starters.",
        features: [
            "Access to Gym Floor",
            "Locker Access",
            "General Trainer Support",
            "Steam  Bath (1x/week)",
        ],
        notIncluded: ["Personal Training", "Diet Plan", "Massage"],
        featured: false,
    },
    {
        name: "PRO",
        price: "₹4,699",
        period: "/ half-year",
        description: "Pay 6 months, get 6 months free. Serious gains.",
        features: [
            "All Basic Benefits",
            "Personal Diet Plan",
            "Steam Bath (Unlimited)",
            "CrossFit Access",
        ],
        notIncluded: ["Massage Therapy"],
        featured: true,
    },
    {
        name: "ELITE",
        price: "₹6,699",
        period: "/ year",
        description: "Pay 1 year, get 1 year free. Total transformation.",
        features: [
            "All Pro Benefits",
            "Dedicated Personal Trainer",
            "Weekly Massage Therapy",
            "Nutrition & Supplement Guide",
            "Guest Pass (2/month)",
        ],
        notIncluded: [],
        featured: false,
    },
];

const programs = [
    {
        name: "Personal Training",
        price: "₹5,000",
        period: "/ month",
        badge: null,
        featured: false,
        features: ["Dedicated personal trainer", "Customized workout plan", "Strength & stretching sessions", "Injury prevention focus", "Weekly progress tracking"],
        whatsapp: "Hi! I'm interested in the Personal Training program (₹5,000/month). Please share more details.",
        buttonText: "Enquire on WhatsApp",
    },
    {
        name: "60 Day Transformation",
        price: "₹9,000",
        period: "",
        badge: "Most Chosen",
        featured: true,
        features: ["8-week structured program", "Fat loss & body recomposition", "Daily diet follow-up via WhatsApp", "Weekend weight check-ins", "Lifestyle & habit correction"],
        whatsapp: "Hi! I'm ready to start my 60 Day Transformation (₹9,000). Let's go!",
        buttonText: "Start Transformation",
    },
    {
        name: "120 Day Transformation",
        price: "₹15,000",
        period: "",
        badge: "Elite Program",
        featured: false,
        features: ["16-week structured coaching", "Dedicated personal trainer", "Customized diet & workout plan", "Targeted fat loss goals", "WhatsApp diet follow-ups", "Weekly weight tracking", "Supplement guidance", "Optional professional photoshoot"],
        whatsapp: "Hi! I want to apply for the 120 Day Elite Transformation Program (₹15,000).",
        buttonText: "Apply Now",
    },
];

function Carousel3D({ items, renderCard }: { items: any[]; renderCard: (item: any, index: number, isActive: boolean) => React.ReactNode }) {
    const [active, setActive] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const next = useCallback(() => setActive((p) => (p + 1) % items.length), [items.length]);
    const prev = useCallback(() => setActive((p) => (p - 1 + items.length) % items.length), [items.length]);

    useEffect(() => {
        if (isAutoPlaying) {
            intervalRef.current = setInterval(next, 3000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isAutoPlaying, next]);

    const handleInteraction = (fn: () => void) => {
        setIsAutoPlaying(false);
        fn();
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const getStyle = (index: number) => {
        const diff = ((index - active) + items.length) % items.length;
        if (diff === 0) return { transform: "translateX(0) scale(1) rotateY(0deg)", zIndex: 10, opacity: 1, filter: "brightness(1)" };
        if (diff === 1 || diff === -(items.length - 1)) return { transform: "translateX(65%) scale(0.8) rotateY(-25deg)", zIndex: 5, opacity: 0.5, filter: "brightness(0.6)" };
        return { transform: "translateX(-65%) scale(0.8) rotateY(25deg)", zIndex: 5, opacity: 0.5, filter: "brightness(0.6)" };
    };

    return (
        <div className="relative w-full" style={{ perspective: "1200px" }}>
            <div className="relative h-[480px] flex items-center justify-center overflow-hidden">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="absolute w-[85%] max-w-[320px] transition-all duration-500 ease-out"
                        style={{ ...getStyle(index), transformStyle: "preserve-3d" }}
                    >
                        {renderCard(item, index, index === active)}
                    </div>
                ))}
            </div>
            <div className="flex justify-center items-center gap-6 mt-4">
                <button onClick={() => handleInteraction(prev)} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#00AEEF] hover:text-[#00AEEF] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                    {items.map((_, i) => (
                        <button key={i} onClick={() => handleInteraction(() => setActive(i))} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === active ? "bg-[#00AEEF] w-6" : "bg-white/20"}`} />
                    ))}
                </div>
                <button onClick={() => handleInteraction(next)} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#00AEEF] hover:text-[#00AEEF] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export function Membership({ user }: { user?: any }) {
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const handleWhatsApp = (message: string) => {
        const phone = "918098834154";
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    };

    const handleSubscribe = async (plan: string) => {
        try {
            setLoadingPlan(plan);
            if (!user) { router.push("/login"); return; }
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to create order");
            const options = {
                key: data.key, amount: data.amount, currency: data.currency,
                name: "Roman Fitness", description: `${plan} Membership`, order_id: data.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/verify-payment", {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature, plan }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) router.push("/dashboard");
                        else alert("Payment verification failed: " + verifyData.message);
                    } catch { alert("Payment verification error"); }
                },
                prefill: { name: user.name || "", contact: user.mobile || user.phone || "" },
                theme: { color: "#00AEEF" },
            };
            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
        } catch (error: any) {
            alert(error.message);
            if (error.message === "Unauthorized") router.push("/login");
        } finally { setLoadingPlan(null); }
    };

    const renderPlanCard = (plan: typeof plans[0], _index: number, _isActive: boolean) => (
        <Card className={`h-full flex flex-col relative border-white/10 overflow-hidden ${plan.featured ? 'bg-zinc-900 ring-2 ring-[#00AEEF] ring-offset-2 ring-offset-black' : 'bg-black'}`}>
            {plan.featured && (
                <div className="absolute top-0 left-0 right-0 flex justify-center z-20 -translate-y-1/2">
                    <span className="bg-[#00AEEF] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-[#00AEEF]/50">Most Popular</span>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl font-bold font-heading tracking-wider">{plan.name}</CardTitle>
                <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2 text-xs">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                            <Check className="w-4 h-4 text-[#00AEEF] mr-2 shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-300">{feature}</span>
                        </li>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                        <li key={i} className="flex items-start opacity-50">
                            <X className="w-4 h-4 text-gray-600 mr-2 shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-500">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    variant={plan.featured ? "premium" : "outline"}
                    className="w-full h-10 text-sm font-bold uppercase tracking-wider hover:border-[#00AEEF] hover:text-[#00AEEF] hover:bg-transparent"
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={loadingPlan === plan.name}
                >
                    {loadingPlan === plan.name ? <Loader2 className="w-4 h-4 animate-spin" /> : `Choose ${plan.name}`}
                </Button>
            </CardFooter>
        </Card>
    );

    const renderProgramCard = (program: typeof programs[0], _index: number, _isActive: boolean) => (
        <Card className={`h-full flex flex-col relative border-white/10 overflow-hidden ${program.featured ? 'bg-zinc-900 ring-2 ring-[#00AEEF] ring-offset-2 ring-offset-black' : 'bg-black'}`}>
            {program.badge && (
                <div className="absolute top-0 left-0 right-0 flex justify-center z-20 -translate-y-1/2">
                    <span className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg ${program.featured ? 'bg-[#00AEEF] shadow-[#00AEEF]/50' : 'bg-zinc-800 border border-white/10'}`}>
                        {program.badge}
                    </span>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl font-bold font-heading tracking-wider">{program.name}</CardTitle>
                <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-extrabold text-white">{program.price}</span>
                    {program.period && <span className="ml-2 text-sm text-muted-foreground">{program.period}</span>}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-2">
                    {program.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                            <Check className="w-4 h-4 text-[#00AEEF] mr-2 shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-300">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    variant={program.featured ? "premium" : "outline"}
                    className="w-full h-10 text-sm font-bold uppercase tracking-wider hover:border-[#00AEEF] hover:text-[#00AEEF] hover:bg-transparent"
                    onClick={() => handleWhatsApp(program.whatsapp)}
                >
                    {program.buttonText}
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <section className="py-24 bg-black relative overflow-hidden" id="plans">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00AEEF]/[0.03] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/[0.03] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-heading font-bold text-white mb-4"
                    >
                        MEMBERSHIP <span className="text-[#00AEEF]">PLANS</span>
                    </motion.h2>
                    <p className="text-muted-foreground">
                        Invest in yourself. No hidden fees. No compromises.
                    </p>
                </div>

                {/* Mobile: 3D Carousel / Desktop: Grid */}
                {isMobile ? (
                    <Carousel3D items={plans} renderCard={renderPlanCard} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.03 }}
                                className="relative"
                            >
                                {plan.featured && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                                        <span className="bg-[#00AEEF] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-[#00AEEF]/50">Most Popular</span>
                                    </div>
                                )}
                                <Card className={`h-full flex flex-col relative border-white/10 overflow-hidden ${plan.featured ? 'bg-zinc-900 ring-2 ring-[#00AEEF] ring-offset-2 ring-offset-black' : 'bg-black'}`}>
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold font-heading tracking-wider">{plan.name}</CardTitle>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                            <span className="ml-2 text-sm text-muted-foreground">{plan.period}</span>
                                        </div>
                                        <CardDescription className="mt-2">{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start">
                                                    <Check className="w-5 h-5 text-[#00AEEF] mr-2 shrink-0" />
                                                    <span className="text-sm text-gray-300">{feature}</span>
                                                </li>
                                            ))}
                                            {plan.notIncluded.map((feature, i) => (
                                                <li key={i} className="flex items-start opacity-50">
                                                    <X className="w-5 h-5 text-gray-600 mr-2 shrink-0" />
                                                    <span className="text-sm text-gray-500">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant={plan.featured ? "premium" : "outline"}
                                            className="w-full h-12 text-lg font-bold uppercase tracking-wider hover:border-[#00AEEF] hover:text-[#00AEEF] hover:bg-transparent"
                                            onClick={() => handleSubscribe(plan.name)}
                                            disabled={loadingPlan === plan.name}
                                        >
                                            {loadingPlan === plan.name ? <Loader2 className="w-5 h-5 animate-spin" /> : `Choose ${plan.name}`}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* TRANSFORMATION & PERSONAL TRAINING PROGRAMS */}
                <div className="mt-32 text-center mb-16 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 uppercase"
                    >
                        TRANSFORMATION & <br className="md:hidden" /><span className="text-[#00AEEF]">PERSONAL TRAINING</span> PROGRAMS
                    </motion.h2>
                    <p className="text-muted-foreground">
                        Result-driven coaching programs designed for serious transformations.
                    </p>
                </div>

                {/* Mobile: 3D Carousel / Desktop: Grid */}
                {isMobile ? (
                    <Carousel3D items={programs} renderCard={renderProgramCard} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto relative z-10">
                        {programs.map((program, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.03 }}
                                className="relative"
                            >
                                {program.badge && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                                        <span className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg ${program.featured ? 'bg-[#00AEEF] shadow-[#00AEEF]/50' : 'bg-zinc-800 border border-white/10'}`}>
                                            {program.badge}
                                        </span>
                                    </div>
                                )}
                                <Card className={`h-full flex flex-col relative border-white/10 overflow-hidden ${program.featured ? 'bg-zinc-900 ring-2 ring-[#00AEEF] ring-offset-2 ring-offset-black' : 'bg-black'} hover:border-[#00AEEF]/50 transition-colors`}>
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold font-heading tracking-wider">{program.name}</CardTitle>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-4xl font-extrabold text-white">{program.price}</span>
                                            {program.period && <span className="ml-2 text-sm text-muted-foreground">{program.period}</span>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {program.features.map((feature, i) => (
                                                <li key={i} className="flex items-start">
                                                    <Check className="w-5 h-5 text-[#00AEEF] mr-2 shrink-0" />
                                                    <span className="text-sm text-gray-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant={program.featured ? "premium" : "outline"}
                                            className="w-full h-12 text-lg font-bold uppercase tracking-wider hover:border-[#00AEEF] hover:text-[#00AEEF] hover:bg-transparent"
                                            onClick={() => handleWhatsApp(program.whatsapp)}
                                        >
                                            {program.buttonText}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
