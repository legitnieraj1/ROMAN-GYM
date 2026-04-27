"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";

export default function DietPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [hasActiveMembership, setHasActiveMembership] = useState<boolean | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [formData, setFormData] = useState({
        weight: "",
        height: "",
        age: "",
        goal: "MAINTAIN",
        vegNonVeg: "Non-Veg"
    });

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch("/api/auth/session");
                const data = await res.json();

                if (!data.userId) {
                    router.replace("/login");
                    return;
                }

                setSession(data);

                const profileRes = await fetch("/api/auth/profile");
                const profile = await profileRes.json();

                if (profile && profile.membership_end) {
                    const endDate = new Date(profile.membership_end);
                    setHasActiveMembership(endDate > new Date());
                } else {
                    setHasActiveMembership(false);
                }
            } catch {
                router.replace("/login");
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAccess();
    }, [router]);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/diet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setPlan(data);
            } else {
                console.error("Diet generation error:", data);
                alert(`Error: ${data.message || "Failed to generate diet"}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth || hasActiveMembership === null) return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#E8192B]" />
        </div>
    );

    if (hasActiveMembership === false) {
        return (
            <div className="min-h-screen bg-[#080808] text-white relative font-sans selection:bg-[#E8192B]/20">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center h-[80vh]">
                    <div className="w-32 h-32 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[rgba(255,255,255,0.3)]/20 relative group mb-8">
                        <div className="absolute inset-0 bg-[#E8192B]/5 rounded-full blur-xl transition-colors"></div>
                        <span className="material-symbols-outlined text-[#E8192B] text-6xl relative z-10" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>restaurant</span>
                    </div>
                    <div className="flex items-baseline gap-4 mb-4">
                        <h1 className="text-[rgba(255,255,255,0.4)] font-heading font-black text-4xl md:text-5xl tracking-tighter uppercase">MEMBER<span className="text-[#f59e0b] italic ml-2">ONLY</span> ACCESS</h1>
                    </div>
                    <p className="text-[rgba(255,255,255,0.35)] font-medium tracking-wide max-w-md mt-4 mb-10">
                        The AI Nutritionist is exclusively available to Gladiator Tech operatives with an active plan. Secure your credentials to access tactical diet plans.
                    </p>
                    <button
                        onClick={() => router.push("/#plans")}
                        className="py-4 px-12 bg-[#E8192B] text-white font-sans font-extrabold uppercase tracking-[2px] hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        VIEW INTEL PLANS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#080808] text-[rgba(255,255,255,0.85)] font-sans selection:bg-[#E8192B]/20">
            {/* TopAppBar inside page to replace existing standalone Navbar for better look, but using Next Navbar component to reuse session/links logic */}
            <div className="fixed top-0 w-full z-50 bg-[#080808]/60 backdrop-blur-xl border-b border-white/5 shadow-[0_20px_40px_rgba(232,25,43,0.15)]">
                <Navbar session={session} />
            </div>

            <main className="relative min-h-screen pt-24 pb-20 md:pb-8 px-4 md:px-8 overflow-hidden">
                {/* Hero Background */}
                <div className="absolute inset-0 -z-10">
                    <img 
                        alt="Background" 
                        src="/diet-bg.webp" 
                        className="w-full h-full object-cover opacity-20 grayscale" 
                        onError={(e) => { e.currentTarget.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCgt5VRhbwY8FTqIkqrRetByxm8Y1kRdazjVlrAESWEJuRnwzHtrTOHcZ1S14XMAvI5erORMcghv72rPfW-5OcGM0WmVg3VL33RZJ0yjjMGZx42cq5QPCDEo78eKAv_EPIx-hMhBLYDfzJWfSCkNVUC-f9NDGMmXHon6-vHWaZt5wI_3B4cHzy_Mrl0ZPZJLmgyeu-r0W4nB4ynB6gk7NpXSaH0hIIz-1O_akx1BcsOuHPQwNpdbkAMzOeIHyib0c4X7liR5ebolwE" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#080808]/80 to-[#080808]"></div>
                    <div className="absolute inset-0" style={{
                        backgroundImage: "radial-gradient(rgba(232,25,43,0.06) 1px, transparent 1px)",
                        backgroundSize: "30px 30px"
                    }}></div>
                </div>

                <div className="max-w-7xl mx-auto space-y-12 mt-12">
                    {/* AI Nutritionist Header */}
                    <section className="flex flex-col gap-2">
                        <div className="flex items-baseline gap-4">
                            <span className="text-[#f59e0b] font-heading font-black text-6xl md:text-8xl italic tracking-tighter">AI</span>
                            <h1 className="text-[rgba(255,255,255,0.4)] font-heading font-black text-5xl md:text-7xl tracking-tighter uppercase">NUTRITIONIST</h1>
                        </div>
                        <div className="h-1 w-32 bg-[#E8192B]"></div>
                        <p className="text-[rgba(255,255,255,0.35)] font-medium tracking-wide max-w-2xl mt-4">
                            Deploying precision algorithms to engineer your metabolic destiny. Input your biometrics to receive a tactical Roman Fitness fueling protocol.
                        </p>
                    </section>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left: Stats Form Panel */}
                        <aside className="lg:col-span-5 bg-[#111111]/60 backdrop-blur-2xl p-8 border-l-2 border-[#E8192B] relative overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#E8192B]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>analytics</span>
                                    <h2 className="font-heading font-bold text-xl uppercase tracking-widest text-[rgba(255,255,255,0.85)]">Biometric Uplink</h2>
                                </div>
                                <form onSubmit={handleGenerate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[rgba(255,255,255,0.35)] font-sans text-[10px] font-bold uppercase tracking-[1.5px]">Weight (kg)</label>
                                            <input 
                                                required
                                                type="number" 
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className="w-full bg-[#080808] border-0 border-b-2 border-transparent focus:border-[#E8192B] focus:ring-0 text-[rgba(255,255,255,0.85)] font-sans p-3 transition-colors" 
                                                placeholder="85"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[rgba(255,255,255,0.35)] font-sans text-[10px] font-bold uppercase tracking-[1.5px]">Height (cm)</label>
                                            <input 
                                                required
                                                type="number" 
                                                name="height"
                                                value={formData.height}
                                                onChange={handleChange}
                                                className="w-full bg-[#080808] border-0 border-b-2 border-transparent focus:border-[#E8192B] focus:ring-0 text-[rgba(255,255,255,0.85)] font-sans p-3 transition-colors" 
                                                placeholder="182"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[rgba(255,255,255,0.35)] font-sans text-[10px] font-bold uppercase tracking-[1.5px]">Current Age</label>
                                        <input 
                                            required
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="w-full bg-[#080808] border-0 border-b-2 border-transparent focus:border-[#E8192B] focus:ring-0 text-[rgba(255,255,255,0.85)] font-sans p-3 transition-colors" 
                                            placeholder="28"
                                            />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[rgba(255,255,255,0.35)] font-sans text-[10px] font-bold uppercase tracking-[1.5px]">Primary Objective</label>
                                        <select 
                                            name="goal"
                                            value={formData.goal}
                                            onChange={handleChange}
                                            className="w-full bg-[#080808] border-0 border-b-2 border-transparent focus:border-[#E8192B] focus:ring-0 text-[rgba(255,255,255,0.85)] font-sans p-3 transition-colors"
                                        >
                                            <option value="BULK">Gain Muscle</option>
                                            <option value="CUT">Lose Fat</option>
                                            <option value="MAINTAIN">Maintain Weight</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[rgba(255,255,255,0.35)] font-sans text-[10px] font-bold uppercase tracking-[1.5px]">Dietary Protocol</label>
                                        <select 
                                            name="vegNonVeg"
                                            value={formData.vegNonVeg}
                                            onChange={handleChange}
                                            className="w-full bg-[#080808] border-0 border-b-2 border-transparent focus:border-[#E8192B] focus:ring-0 text-[rgba(255,255,255,0.85)] font-sans p-3 transition-colors"
                                        >
                                            <option value="Non-Veg">Non-Vegetarian</option>
                                            <option value="Veg">Vegetarian</option>
                                            <option value="Vegan">Vegan</option>
                                        </select>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full py-4 mt-4 bg-[#E8192B] text-white font-sans font-extrabold uppercase tracking-[2px] hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>}
                                        {loading ? "GENERATING..." : "GENERATE PLAN"}
                                    </button>
                                </form>
                            </div>
                        </aside>

                        {/* Right: Diet Plan Preview */}
                        <section className="lg:col-span-7 bg-[#0d0d0d] p-1 relative min-h-[600px] flex flex-col items-stretch">
                            <div className="flex-1 bg-[#0f0f0f] p-6 lg:p-8 flex flex-col text-left space-y-6 overflow-y-auto w-full">
                                {!plan ? (
                                    <div className="h-full flex-1 flex flex-col justify-center items-center text-center">
                                        <div className="w-32 h-32 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[rgba(255,255,255,0.3)]/20 relative group mb-6">
                                            <div className="absolute inset-0 bg-[#E8192B]/5 rounded-full blur-xl group-hover:bg-[#E8192B]/10 transition-colors"></div>
                                            <span className="material-symbols-outlined text-[#E8192B] text-6xl relative z-10" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>restaurant</span>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-heading font-bold text-2xl uppercase tracking-tighter text-[rgba(255,255,255,0.85)]">Tactical Intel Awaiting Command</h3>
                                            <p className="text-[rgba(255,255,255,0.35)] max-w-md mx-auto">
                                                Configure your biometrics and execute the generation protocol to reveal your customized high-performance diet plan.
                                            </p>
                                        </div>
                                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 opacity-20 select-none pointer-events-none">
                                            <div className="h-24 bg-[#1a1a1a] border border-[rgba(255,255,255,0.3)]/10"></div>
                                            <div className="h-24 bg-[#1a1a1a] border border-[rgba(255,255,255,0.3)]/10"></div>
                                            <div className="h-24 bg-[#1a1a1a] border border-[rgba(255,255,255,0.3)]/10"></div>
                                            <div className="h-24 bg-[#1a1a1a] border border-[rgba(255,255,255,0.3)]/10"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex-1 w-full space-y-4 animate-fade-in-up">
                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1a1a1a]">
                                            <h3 className="font-heading font-bold text-xl uppercase tracking-widest text-[#E8192B] flex items-center gap-2">
                                                <span className="material-symbols-outlined">analytics</span>
                                                Protocol Active
                                            </h3>
                                            <div className="flex gap-2 text-xs font-sans bg-[#080808] p-2 rounded">
                                                <span className="text-[rgba(255,255,255,0.35)]">CALS: <b className="text-[rgba(255,255,255,0.85)]">{plan.calories}</b></span>
                                                <span className="text-[rgba(255,255,255,0.35)] border-l border-[#1a1a1a] pl-2">PRO: <b className="text-[rgba(255,255,255,0.85)]">{plan.protein}g</b></span>
                                            </div>
                                        </div>
                                        <div className="space-y-4 w-full text-sm lg:text-base font-sans">
                                            {plan.weeklyPlan.split('\n').map((line: string, index: number) => {
                                                if (line.trim().startsWith('##')) {
                                                    return (
                                                        <h3 key={index} className="text-lg lg:text-xl font-black text-[#E8192B] mt-6 mb-2 border-b border-white/5 pb-2 uppercase tracking-tight">
                                                            {line.replace(/^##\s+/, '').replace(/\*\*/g, '')}
                                                        </h3>
                                                    );
                                                }
                                                if (line.trim().startsWith('###')) {
                                                    return (
                                                        <h4 key={index} className="text-md lg:text-lg font-bold text-[rgba(255,255,255,0.85)] mt-5 mb-2 uppercase">
                                                            {line.replace(/^###\s+/, '').replace(/\*\*/g, '')}
                                                        </h4>
                                                    );
                                                }
                                                if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                                                    return (
                                                        <h4 key={index} className="text-base font-bold text-[rgba(255,255,255,0.85)] mt-4 mb-2">
                                                            {line.replace(/\*\*/g, '')}
                                                        </h4>
                                                    );
                                                }
                                                if (line.trim().startsWith('-')) {
                                                    return (
                                                        <div key={index} className="flex items-start gap-3 ml-2 text-[rgba(255,255,255,0.4)]">
                                                            <span className="text-[#E8192B] mt-1 text-xs">◆</span>
                                                            <p className="flex-1 leading-relaxed">
                                                                {line.replace(/^- /, '').split('**').map((part: string, i: number) =>
                                                                    i % 2 === 1 ? <span key={i} className="font-bold text-[rgba(255,255,255,0.85)]">{part}</span> : part
                                                                )}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                if (!line.trim()) {
                                                    return <div key={index} className="h-2"></div>;
                                                }
                                                return (
                                                    <p key={index} className="text-[rgba(255,255,255,0.35)] leading-relaxed">
                                                        {line.split('**').map((part: string, i: number) =>
                                                            i % 2 === 1 ? <strong key={i} className="text-[rgba(255,255,255,0.85)] font-bold">{part}</strong> : part
                                                        )}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Footer Label for Section */}
                            <div className="bg-[#1a1a1a] px-6 py-3 flex justify-between items-center w-full shrink-0">
                                <span className="text-[rgba(255,255,255,0.35)] font-sans text-[10px] font-bold uppercase tracking-[1.5px]">{plan ? 'Protocol: Generated' : 'System Status: Ready'}</span>
                                <span className="text-[#E8192B] font-sans text-[10px] font-bold uppercase tracking-[1.5px]">ROMAN FITNESS v4.0</span>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
