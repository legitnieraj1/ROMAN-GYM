import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import {
    User, CreditCard, Calendar, Shield, Flame, Trophy,
    Medal, Swords, Target, Zap, Clock, ChevronRight, LogOut, Dumbbell, Star, TrendingUp
} from "lucide-react";
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog";
import { getMedalData } from "@/app/actions/attendance";
import { ALL_MEDALS, TIER_COLORS, TIER_LABELS, CATEGORY_COLORS, computeMedals, type MedalStats, type MedalCategory } from "@/lib/medals";
import { MedalVault } from "@/components/dashboard/MedalVault";

function getDaysRemaining(endDate: string) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.userId) {
        redirect("/login");
    }

    let memberProfile: any = null;
    let medalStats: MedalStats = {
        totalCheckIns: 0, currentStreak: 0, longestStreak: 0, previousStreak: 0,
        avgSessionMinutes: 0, longestSessionMinutes: 0,
        sessions60Plus: 0, sessions90Plus: 0, sessions120Plus: 0,
        validSessions: 0, comebackActive: false,
    };

    if (supabaseAdmin) {
        const { data } = await supabaseAdmin
            .from("members")
            .select("*")
            .eq("id", session.userId)
            .single();
        memberProfile = data;

        const mData = await getMedalData(session.userId);
        if (mData) medalStats = mData;

        const { data: latestPayment } = await supabaseAdmin
            .from("member_payments")
            .select("plan")
            .eq("member_id", session.userId)
            .eq("status", "SUCCESS")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (latestPayment && memberProfile) {
            memberProfile.plan = latestPayment.plan;
        }
    }

    if (!memberProfile) {
        return (
            <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md p-8">
                    <div className="w-16 h-16 mx-auto bg-[#E8192B]/10 flex items-center justify-center border border-[#E8192B]/20">
                        <User className="w-8 h-8 text-[#E8192B]" />
                    </div>
                    <h1 className="font-heading text-3xl uppercase tracking-wider">Profile Not Found</h1>
                    <p className="text-white/40 text-sm">Your profile could not be loaded. Please log in again.</p>
                    <Link href="/login" className="inline-block px-8 py-3 bg-[#E8192B] text-white font-bold text-sm uppercase tracking-widest">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    const isActive = memberProfile.membership_end
        ? new Date(memberProfile.membership_end) > new Date()
        : false;
    const daysRemaining = memberProfile.membership_end ? getDaysRemaining(memberProfile.membership_end) : 0;
    const membershipProgress = memberProfile.membership_start && memberProfile.membership_end
        ? Math.min(100, Math.max(0, ((new Date().getTime() - new Date(memberProfile.membership_start).getTime()) /
            (new Date(memberProfile.membership_end).getTime() - new Date(memberProfile.membership_start).getTime())) * 100))
        : 0;

    const { totalCheckIns, currentStreak } = medalStats;
    const rank = totalCheckIns >= 100 ? "Centurion" : totalCheckIns >= 50 ? "Gladiator" : totalCheckIns >= 20 ? "Warrior" : "Legionnaire";

    const { unlocked, locked, nextMedal, total } = computeMedals(medalStats);

    return (
        <div className="min-h-screen bg-[#080808] text-white">

            {/* ── Top Nav ── */}
            <header className="fixed top-0 w-full z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-5 h-15 flex items-center justify-between" style={{ height: "60px" }}>
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image src="/logoroman.png" alt="Roman Fitness" width={32} height={32} className="h-8 w-auto" />
                        <span className="font-heading text-base tracking-[0.2em] text-white hidden sm:block">ROMAN FITNESS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/#plans"
                            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#E8192B] text-white font-bold text-[10px] uppercase tracking-[0.25em] hover:shadow-[0_0_20px_rgba(232,25,43,0.4)] transition-shadow"
                        >
                            <Zap className="w-3 h-3" />
                            Upgrade
                        </Link>
                        <div className="w-8 h-8 bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
                            {memberProfile.photo_url
                                ? <img src={memberProfile.photo_url} alt={memberProfile.name} className="h-full w-full object-cover" />
                                : <User className="h-4 w-4 text-white/30" />
                            }
                        </div>
                    </div>
                </div>
            </header>

            <main id="main-content" className="pt-[60px]">

                {/* ── Hero Banner ── */}
                <div className="relative overflow-hidden" style={{ minHeight: "200px" }}>
                    <Image
                        src="/gym/corridor-1.jpg"
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover object-center"
                        style={{ opacity: 0.18 }}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-transparent to-[#080808]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/40 via-transparent to-[#080808]/40" />
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(232,25,43,0.10) 0%, transparent 60%)" }}
                    />

                    <div className="relative z-10 max-w-7xl mx-auto px-5 py-10 pb-14">
                        {/* Rank badge */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8192B]/15 border border-[#E8192B]/30 text-[#E8192B] text-[9px] font-bold tracking-[0.35em] uppercase">
                                <Star className="w-3 h-3" />
                                {rank}
                            </span>
                            {memberProfile.enroll_no && (
                                <span className="text-white/20 font-mono text-[9px] tracking-[0.4em] uppercase">
                                    RF-{memberProfile.enroll_no}
                                </span>
                            )}
                        </div>

                        <h1
                            className="font-heading text-white leading-none tracking-wider uppercase"
                            style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}
                        >
                            {memberProfile.name?.split(" ")[0]}{" "}
                            <span style={{ color: "#E8192B", textShadow: "0 0 40px rgba(232,25,43,0.4)" }}>
                                {memberProfile.name?.split(" ").slice(1).join(" ")}
                            </span>
                        </h1>

                        {/* XP bar */}
                        <div className="mt-5 max-w-sm">
                            <div className="flex justify-between text-[9px] font-bold tracking-widest uppercase mb-1.5 text-white/30">
                                <span>XP Progress</span>
                                <span className="text-[#E8192B]">{totalCheckIns * 100} XP</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.06]">
                                <div
                                    className="h-full bg-[#E8192B] transition-all duration-1000"
                                    style={{ width: `${Math.min(95, (totalCheckIns % 10) * 10 + 5)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="max-w-7xl mx-auto px-5 -mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: Flame, label: "Current Streak", value: `${currentStreak}`, unit: "days", accent: "#E8192B" },
                            { icon: Dumbbell, label: "Total Check-ins", value: `${totalCheckIns}`, unit: "sessions", accent: "#E8192B" },
                            { icon: Shield, label: "Status", value: isActive ? "ACTIVE" : "EXPIRED", unit: memberProfile.plan || "", accent: isActive ? "#E8192B" : "#f59e0b" },
                            { icon: Clock, label: "Days Remaining", value: `${Math.max(0, daysRemaining)}`, unit: "days left", accent: daysRemaining <= 7 ? "#f59e0b" : "#E8192B" },
                        ].map(({ icon: Icon, label, value, unit, accent }) => (
                            <div key={label} className="bg-[#0f0f0f] border border-white/[0.06] p-5 relative overflow-hidden group hover:border-white/10 transition-colors" style={{ borderTopColor: accent, borderTopWidth: 2 }}>
                                <div className="flex justify-between items-start mb-3">
                                    <Icon className="w-4 h-4" style={{ color: accent }} />
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">{label}</span>
                                </div>
                                <p className="font-heading text-2xl md:text-3xl tracking-wider text-white leading-none">{value}</p>
                                <p className="text-[9px] font-bold text-white/25 uppercase tracking-wider mt-1">{unit}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Main Grid ── */}
                <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 md:pb-12">

                    {/* LEFT COL */}
                    <div className="lg:col-span-5 space-y-5">

                        {/* Profile card */}
                        <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-0.5 h-4 bg-[#E8192B]" />
                                    <h2 className="font-heading text-base uppercase tracking-wider text-white">Profile</h2>
                                </div>
                                <EditProfileDialog memberProfile={memberProfile} />
                            </div>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 bg-[#181818] border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {memberProfile.photo_url
                                        ? <img src={memberProfile.photo_url} alt={memberProfile.name} className="h-full w-full object-cover" />
                                        : <User className="h-6 w-6 text-white/25" />
                                    }
                                </div>
                                <div>
                                    <p className="font-bold text-white text-base leading-tight">{memberProfile.name}</p>
                                    <p className="text-white/35 text-xs mt-0.5">{memberProfile.mobile}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    memberProfile.dob && { label: "Date of Birth", value: formatDate(memberProfile.dob) },
                                    memberProfile.age && { label: "Age", value: `${memberProfile.age} yrs` },
                                    memberProfile.weight && { label: "Weight", value: `${memberProfile.weight} kg` },
                                    memberProfile.height && { label: "Height", value: `${memberProfile.height} cm` },
                                ].filter(Boolean).map((item: any) => (
                                    <div key={item.label} className="bg-[#080808] px-3 py-2.5">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-white/80">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Membership card */}
                        <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-0.5 h-4 bg-[#E8192B]" />
                                    <h2 className="font-heading text-base uppercase tracking-wider text-white">Membership</h2>
                                </div>
                                <CreditCard className="w-4 h-4 text-[#E8192B]" />
                            </div>

                            {memberProfile.membership_start ? (
                                <div className="space-y-5">
                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex justify-between text-[9px] font-bold tracking-widest uppercase mb-2 text-white/30">
                                            <span>{formatDate(memberProfile.membership_start)}</span>
                                            <span className={daysRemaining <= 0 ? "text-[#f59e0b]" : ""}>
                                                {memberProfile.membership_end ? formatDate(memberProfile.membership_end) : "—"}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/[0.06]">
                                            <div
                                                className="h-full transition-all duration-1000"
                                                style={{
                                                    width: `${membershipProgress}%`,
                                                    background: isActive ? "#E8192B" : "#f59e0b"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: "Plan", value: memberProfile.plan || "N/A", highlight: true },
                                            { label: "Start", value: memberProfile.membership_start ? formatDate(memberProfile.membership_start) : "—" },
                                            { label: "End", value: memberProfile.membership_end ? formatDate(memberProfile.membership_end) : "—" },
                                        ].map(({ label, value, highlight }) => (
                                            <div key={label} className="bg-[#080808] px-3 py-2.5">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 mb-1">{label}</p>
                                                <p className={`text-xs font-bold ${highlight ? "text-[#E8192B]" : "text-white/70"}`}>{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {(!isActive || daysRemaining <= 7) && (
                                        <Link
                                            href="/#plans"
                                            className="flex items-center justify-between p-4 bg-[#E8192B]/08 border border-[#E8192B]/20 hover:border-[#E8192B]/40 transition-all group"
                                        >
                                            <div>
                                                <p className="font-bold text-sm text-[#E8192B] uppercase tracking-wider">
                                                    {isActive ? "⚡ Renew Soon" : "Renew Membership"}
                                                </p>
                                                <p className="text-[10px] text-white/30 mt-0.5">
                                                    {isActive ? `${daysRemaining} days left` : "Membership expired"}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-[#E8192B] group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-white/30 text-sm mb-5">No active membership.</p>
                                    <Link href="/#plans" className="inline-block px-8 py-3 bg-[#E8192B] text-white font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(232,25,43,0.4)] transition-shadow">
                                        View Plans
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Session stats (only when there are real sessions) */}
                        {medalStats.validSessions > 0 && (
                            <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-0.5 h-4 bg-[#E8192B]" />
                                    <h2 className="font-heading text-base uppercase tracking-wider text-white">Session Stats</h2>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: "Avg Session", value: medalStats.avgSessionMinutes, unit: "min", color: "#FFD700" },
                                        { label: "Longest", value: medalStats.longestSessionMinutes, unit: "min", color: "#E8192B" },
                                        { label: "Best Streak", value: medalStats.longestStreak, unit: "days", color: "#E8192B" },
                                    ].map(({ label, value, unit, color }) => (
                                        <div key={label} className="bg-[#080808] px-3 py-3 text-center">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-2">{label}</p>
                                            <p className="font-heading text-2xl leading-none" style={{ color }}>{value}</p>
                                            <p className="text-[8px] text-white/20 uppercase mt-1">{unit}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-0.5 h-4 bg-white/20" />
                                <h2 className="font-heading text-base uppercase tracking-wider text-white">Quick Links</h2>
                            </div>
                            <div className="space-y-1.5">
                                {[
                                    { href: "/dashboard/ranking", icon: Trophy, label: "Legion Rankings", color: "#FFD700" },
                                    { href: "/#plans", icon: CreditCard, label: "View Plans", color: "#E8192B" },
                                    { href: "/#trainers", icon: Dumbbell, label: "Our Trainers", color: "#E8192B" },
                                    { href: "/", icon: Target, label: "Back to Home", color: "#f59e0b" },
                                ].map(({ href, icon: Icon, label, color }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="flex items-center justify-between px-4 py-3 bg-[#080808] border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.02] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-4 h-4" style={{ color }} />
                                            <span className="text-sm font-bold uppercase tracking-wider text-white/70 group-hover:text-white/90 transition-colors">{label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL */}
                    <div className="lg:col-span-7 space-y-5">
                        <MedalVault
                            stats={medalStats}
                            unlocked={unlocked.map(m => ({ id: m.id, label: m.label, desc: m.desc, icon: m.icon, tier: m.tier, category: m.category, categoryLabel: m.categoryLabel }))}
                            locked={locked.map(m => {
                                const prog = m.progress(medalStats);
                                return { id: m.id, label: m.label, desc: m.desc, icon: m.icon, tier: m.tier, category: m.category, categoryLabel: m.categoryLabel, progress: prog };
                            })}
                            nextMedal={nextMedal ? {
                                id: nextMedal.id, label: nextMedal.label, desc: nextMedal.desc, icon: nextMedal.icon, tier: nextMedal.tier,
                                category: nextMedal.category, categoryLabel: nextMedal.categoryLabel,
                                progress: nextMedal.progress(medalStats),
                            } : null}
                            total={total}
                        />

                        {/* Battle Nutrition */}
                        <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-0.5 h-4 bg-[#E8192B]" />
                                <h2 className="font-heading text-base uppercase tracking-wider text-white">Battle Nutrition</h2>
                            </div>
                            <div className="bg-[#080808] p-6 text-center space-y-4 border border-white/[0.04]">
                                <div className="w-10 h-10 mx-auto bg-[#E8192B]/10 border border-[#E8192B]/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-[#E8192B]" />
                                </div>
                                <p className="text-white/30 text-sm">No personalized nutrition plan yet.</p>
                                <Link
                                    href="/diet"
                                    className="inline-block px-6 py-2.5 bg-[#E8192B] text-white font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(232,25,43,0.4)] transition-shadow"
                                >
                                    Generate AI Plan
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile bottom nav */}
            <nav className="fixed bottom-0 left-0 w-full bg-[#080808]/95 backdrop-blur-xl border-t border-white/[0.06] flex justify-around items-center md:hidden z-50" style={{ height: "60px" }}>
                {[
                    { href: "/dashboard", icon: Zap, label: "Arena", active: true },
                    { href: "/dashboard/ranking", icon: Trophy, label: "Ranks", active: false },
                    { href: "/diet", icon: Flame, label: "Diet", active: false },
                    { href: "/#plans", icon: CreditCard, label: "Plans", active: false },
                ].map(({ href, icon: Icon, label, active }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center gap-1 transition-colors ${active ? "text-[#E8192B]" : "text-white/25 hover:text-white/50"}`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
