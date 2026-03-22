import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import {
    User, CreditCard, Calendar, Shield, Flame, Trophy,
    Medal, Swords, Target, Zap, Clock, ChevronRight, LogOut, Dumbbell
} from "lucide-react";
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog";

// Medal definitions
const medals = [
    { icon: Swords, label: "First Blood", desc: "Complete first workout", color: "text-[#b6c4ff]", unlocked: true },
    { icon: Shield, label: "Iron Guard", desc: "7-day streak", color: "text-[#00daf3]", unlocked: true },
    { icon: Flame, label: "Inferno", desc: "30-day streak", color: "text-[#ffb4ab]", unlocked: true },
    { icon: Trophy, label: "Centurion", desc: "100 workouts", color: "text-[#b6c4ff]", unlocked: false },
    { icon: Medal, label: "Gladiator", desc: "6 months active", color: "text-[#00daf3]", unlocked: false },
    { icon: Target, label: "Precision", desc: "Never miss a week", color: "text-[#bec8d3]", unlocked: false },
];

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
    let attendanceStreak = 0;
    let totalCheckIns = 0;

    if (supabaseAdmin) {
        const { data } = await supabaseAdmin
            .from("members")
            .select("*")
            .eq("id", session.userId)
            .single();
        memberProfile = data;

        // Get attendance data
        const { data: attendance } = await supabaseAdmin
            .from("attendance")
            .select("*")
            .eq("member_id", session.userId)
            .order("check_in_time", { ascending: false });

        if (attendance) {
            totalCheckIns = attendance.length;
            // Calculate streak (consecutive days with check-ins)
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (let i = 0; i < 365; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(checkDate.getDate() - i);
                const dateStr = checkDate.toISOString().split("T")[0];
                const hasCheckIn = attendance.some((a: any) =>
                    a.date === dateStr || (a.check_in_time && a.check_in_time.startsWith(dateStr))
                );
                if (hasCheckIn || (i === 0)) {
                    if (hasCheckIn) streak++;
                    else if (i === 0) continue; // today might not have checked in yet
                } else {
                    break;
                }
            }
            attendanceStreak = streak;
        }

        // Fetch latest payment plan
        const { data: latestPayment } = await supabaseAdmin
            .from("member_payments")
            .select("plan")
            .eq("member_id", session.userId)
            .eq("status", "SUCCESS")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (latestPayment) {
            memberProfile.plan = latestPayment.plan;
        }
    }

    if (!memberProfile) {
        return (
            <div className="min-h-screen bg-[#131314] text-white flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md p-8">
                    <div className="w-16 h-16 mx-auto bg-[#0059ff]/10 flex items-center justify-center border border-[#0059ff]/20">
                        <User className="w-8 h-8 text-[#b6c4ff]" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Profile Not Found</h1>
                    <p className="text-[#bec8d3] opacity-60">Your warrior profile could not be loaded. Re-authenticate to access the Arena.</p>
                    <Link
                        href="/login"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] text-[#00164f] font-black text-sm uppercase tracking-widest"
                    >
                        Re-authenticate
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

    // Determine rank based on total check-ins
    const rank = totalCheckIns >= 100 ? "Centurion" : totalCheckIns >= 50 ? "Gladiator" : totalCheckIns >= 20 ? "Warrior" : "Recruit";
    const rankLevel = totalCheckIns >= 100 ? "III" : totalCheckIns >= 50 ? "II" : totalCheckIns >= 20 ? "I" : "0";

    return (
        <div className="min-h-screen bg-[#131314] text-[#e5e2e3]">
            {/* Top Bar */}
            <header className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-md flex justify-between items-center px-6 h-16 border-b border-[#0059ff]/10">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/logooo.png" alt="Roman Fitness" width={32} height={32} className="h-8 w-auto" />
                    <span className="text-lg font-black italic text-[#b6c4ff] tracking-widest hidden sm:block">ARENA COMMAND</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/#plans"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] text-[#00164f] font-black text-[10px] uppercase tracking-widest"
                    >
                        <Zap className="w-3 h-3" />
                        Upgrade
                    </Link>
                    <div className="h-9 w-9 bg-[#2a2a2b] border border-[#434656]/30 flex items-center justify-center overflow-hidden">
                        {memberProfile.photo_url ? (
                            <img src={memberProfile.photo_url} alt={memberProfile.name} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4 text-[#bec8d3]" />
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-24 px-4 sm:px-6 pb-24 md:pb-12 max-w-6xl mx-auto">
                {/* Gladiator HUD Header */}
                <section className="mb-8 relative overflow-hidden bg-[#0e0e0f] p-6 sm:p-8 border-l-4 border-[#0059ff]">
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: "radial-gradient(circle at 2px 2px, #b6c4ff 1px, transparent 0)",
                        backgroundSize: "24px 24px"
                    }} />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-[#0059ff]/20 text-[#b6c4ff] px-3 py-1 text-[10px] font-bold tracking-[2px] border border-[#0059ff]/30 uppercase">
                                    {rank} {rankLevel}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">
                                Commander <span className="text-[#b6c4ff] italic">{memberProfile.name?.split(" ")[0]}</span>
                            </h1>
                            {memberProfile.enroll_no && (
                                <p className="text-[10px] text-[#bec8d3] opacity-40 font-mono mt-2 tracking-widest">
                                    RF-{memberProfile.enroll_no}
                                </p>
                            )}
                        </div>
                        <div className="w-full md:w-80">
                            <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2 text-[#b6c4ff]">
                                <span>XP Progress</span>
                                <span>{totalCheckIns * 100} / {(Math.ceil(totalCheckIns / 10) + 1) * 1000} XP</span>
                            </div>
                            <div className="h-2 w-full bg-[#353436] border border-[#434656]/20 p-[1px]">
                                <div
                                    className="h-full bg-gradient-to-r from-[#b6c4ff] to-[#00daf3]"
                                    style={{ width: `${Math.min(95, (totalCheckIns % 10) * 10 + 5)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    {/* Attendance Streak */}
                    <div className="bg-[#2a2a2b] p-5 flex flex-col justify-between min-h-[140px] border-l-2 border-[#00daf3]">
                        <div className="flex justify-between items-start">
                            <Flame className="w-5 h-5 text-[#00daf3]" />
                            <span className="text-[9px] font-bold text-[#bec8d3] opacity-40 tracking-widest uppercase">Streak</span>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black">{attendanceStreak} DAYS</h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#00daf3] mt-1">Legion Loyalty</p>
                        </div>
                    </div>

                    {/* Total Check-ins */}
                    <div className="bg-[#2a2a2b] p-5 flex flex-col justify-between min-h-[140px] border-l-2 border-[#b6c4ff]">
                        <div className="flex justify-between items-start">
                            <Dumbbell className="w-5 h-5 text-[#b6c4ff]" />
                            <span className="text-[9px] font-bold text-[#bec8d3] opacity-40 tracking-widest uppercase">Total</span>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black">{totalCheckIns}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#b6c4ff] mt-1">Battles Won</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-[#2a2a2b] p-5 flex flex-col justify-between min-h-[140px] border-l-2 border-[#0059ff]">
                        <div className="flex justify-between items-start">
                            <Shield className="w-5 h-5 text-[#0059ff]" />
                            <span className="text-[9px] font-bold text-[#bec8d3] opacity-40 tracking-widest uppercase">Status</span>
                        </div>
                        <div>
                            <h3 className={`text-2xl sm:text-3xl font-black ${isActive ? "text-[#00daf3]" : "text-[#ffb4ab]"}`}>
                                {isActive ? "ACTIVE" : "EXPIRED"}
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#bec8d3] opacity-60 mt-1">
                                {memberProfile.plan || "No Plan"}
                            </p>
                        </div>
                    </div>

                    {/* Days Remaining */}
                    <div className="bg-[#2a2a2b] p-5 flex flex-col justify-between min-h-[140px] border-l-2 border-[#ffb4ab]">
                        <div className="flex justify-between items-start">
                            <Clock className="w-5 h-5 text-[#ffb4ab]" />
                            <span className="text-[9px] font-bold text-[#bec8d3] opacity-40 tracking-widest uppercase">Timer</span>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black">
                                {daysRemaining > 0 ? daysRemaining : 0}
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#ffb4ab] mt-1">Days Remaining</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Profile + Membership */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-[#1c1b1c] p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-black text-lg uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-1 h-5 bg-[#b6c4ff]" />
                                    Warrior Profile
                                </h2>
                                <EditProfileDialog memberProfile={memberProfile} />
                            </div>

                            <div className="flex items-start gap-5 mb-6">
                                <div className="h-16 w-16 bg-[#2a2a2b] border border-[#434656]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {memberProfile.photo_url ? (
                                        <img src={memberProfile.photo_url} alt={memberProfile.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-8 w-8 text-[#bec8d3] opacity-40" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-xl uppercase tracking-tight truncate">{memberProfile.name}</h3>
                                    <p className="text-[#bec8d3] opacity-60 text-sm">{memberProfile.mobile}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                {memberProfile.dob && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-40 mb-1">Date of Birth</span>
                                        <span className="font-bold">{formatDate(memberProfile.dob)}</span>
                                    </div>
                                )}
                                {memberProfile.age && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-40 mb-1">Age</span>
                                        <span className="font-bold">{memberProfile.age} years</span>
                                    </div>
                                )}
                                {memberProfile.weight && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-40 mb-1">Weight</span>
                                        <span className="font-bold">{memberProfile.weight} kg</span>
                                    </div>
                                )}
                                {memberProfile.height && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-40 mb-1">Height</span>
                                        <span className="font-bold">{memberProfile.height} cm</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Membership / Fee Card */}
                        <div className="bg-[#1c1b1c] p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-black text-lg uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-1 h-5 bg-[#00daf3]" />
                                    Membership Status
                                </h2>
                                <CreditCard className="w-5 h-5 text-[#00daf3]" />
                            </div>

                            {memberProfile.membership_start ? (
                                <div className="space-y-6">
                                    {/* Timeline Bar */}
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
                                            <span className="text-[#00daf3]">
                                                {formatDate(memberProfile.membership_start)}
                                            </span>
                                            <span className={daysRemaining > 0 ? "text-[#bec8d3] opacity-60" : "text-[#ffb4ab]"}>
                                                {memberProfile.membership_end ? formatDate(memberProfile.membership_end) : "—"}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-[#353436] border border-[#434656]/20 p-[1px]">
                                            <div
                                                className={`h-full ${isActive ? "bg-gradient-to-r from-[#00daf3] to-[#0059ff]" : "bg-[#ffb4ab]"}`}
                                                style={{ width: `${membershipProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Fee Details Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div className="bg-[#0e0e0f] p-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-40 block mb-1">Plan</span>
                                            <span className="font-black text-sm uppercase tracking-wider text-[#b6c4ff]">
                                                {memberProfile.plan || "N/A"}
                                            </span>
                                        </div>
                                        <div className="bg-[#0e0e0f] p-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-40 block mb-1">Start Date</span>
                                            <span className="font-bold text-sm">
                                                {formatDate(memberProfile.membership_start)}
                                            </span>
                                        </div>
                                        <div className="bg-[#0e0e0f] p-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-40 block mb-1">End Date</span>
                                            <span className={`font-bold text-sm ${!isActive ? "text-[#ffb4ab]" : ""}`}>
                                                {memberProfile.membership_end ? formatDate(memberProfile.membership_end) : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Renewal CTA */}
                                    {(!isActive || daysRemaining <= 7) && (
                                        <Link
                                            href="/#plans"
                                            className="flex items-center justify-between w-full px-6 py-4 bg-gradient-to-r from-[#0059ff]/20 to-transparent border border-[#0059ff]/20 group hover:border-[#0059ff]/40 transition-all"
                                        >
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-wider text-[#b6c4ff]">
                                                    {isActive ? "Renew Soon" : "Renew Membership"}
                                                </p>
                                                <p className="text-[10px] text-[#bec8d3] opacity-60 mt-1">
                                                    {isActive ? `${daysRemaining} days remaining — renew now to avoid gaps` : "Your membership has expired. Renew to continue training."}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-[#0059ff] group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-[#bec8d3] opacity-60 mb-6">No active membership found.</p>
                                    <Link
                                        href="/#plans"
                                        className="inline-block px-8 py-3 bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] text-[#00164f] font-black text-sm uppercase tracking-widest"
                                    >
                                        View Plans
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Medals + Diet */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Medal Vault */}
                        <div className="bg-[#1c1b1c] p-6 sm:p-8">
                            <h2 className="font-black text-lg uppercase tracking-widest flex items-center gap-3 mb-6">
                                <span className="w-1 h-5 bg-[#0059ff]" />
                                Medal Vault
                            </h2>
                            <div className="grid grid-cols-3 gap-2">
                                {medals.map((medal, i) => {
                                    const Icon = medal.icon;
                                    return (
                                        <div
                                            key={i}
                                            className={`aspect-square bg-[#0e0e0f] flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer group ${
                                                medal.unlocked
                                                    ? "border-[#434656]/20 hover:border-[#0059ff]/40"
                                                    : "border-[#434656]/10 opacity-20 cursor-not-allowed"
                                            }`}
                                        >
                                            <Icon className={`w-7 h-7 ${medal.color} ${medal.unlocked ? "group-hover:scale-110 transition-transform" : ""}`} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-60">
                                                {medal.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-4 text-[10px] text-center font-bold tracking-[2px] text-[#bec8d3] uppercase opacity-40">
                                {medals.filter(m => m.unlocked).length} / {medals.length} Achievements Unlocked
                            </p>
                        </div>

                        {/* Diet Plan */}
                        <div className="bg-[#1c1b1c] p-6 sm:p-8">
                            <h2 className="font-black text-lg uppercase tracking-widest flex items-center gap-3 mb-6">
                                <span className="w-1 h-5 bg-[#00daf3]" />
                                Battle Nutrition
                            </h2>
                            <div className="bg-[#0e0e0f] p-6 text-center space-y-4">
                                <div className="w-12 h-12 mx-auto bg-[#2a2a2b] flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-[#00daf3]" />
                                </div>
                                <p className="text-[#bec8d3] opacity-60 text-sm">No personalized battle nutrition plan yet.</p>
                                <Link
                                    href="/diet"
                                    className="inline-block px-6 py-3 bg-[#2a2a2b] text-[#b6c4ff] font-black text-[10px] uppercase tracking-widest border border-[#434656]/20 hover:border-[#0059ff]/40 transition-all"
                                >
                                    Generate AI Plan
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-[#1c1b1c] p-6 sm:p-8">
                            <h2 className="font-black text-lg uppercase tracking-widest flex items-center gap-3 mb-6">
                                <span className="w-1 h-5 bg-[#bec8d3]" />
                                Quick Actions
                            </h2>
                            <div className="space-y-2">
                                <Link
                                    href="/#plans"
                                    className="flex items-center justify-between p-4 bg-[#0e0e0f] border border-[#434656]/10 hover:border-[#0059ff]/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-4 h-4 text-[#b6c4ff]" />
                                        <span className="text-sm font-bold uppercase tracking-wider">View Plans</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#bec8d3] opacity-40 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/#trainers"
                                    className="flex items-center justify-between p-4 bg-[#0e0e0f] border border-[#434656]/10 hover:border-[#0059ff]/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Dumbbell className="w-4 h-4 text-[#00daf3]" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Our Trainers</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#bec8d3] opacity-40 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/"
                                    className="flex items-center justify-between p-4 bg-[#0e0e0f] border border-[#434656]/10 hover:border-[#0059ff]/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Target className="w-4 h-4 text-[#ffb4ab]" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Back to Arena</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#bec8d3] opacity-40 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full bg-[#131314]/95 border-t border-[#0059ff]/10 flex justify-around items-center md:hidden h-16 z-50">
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#b6c4ff]">
                    <Zap className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Arena</span>
                </Link>
                <Link href="/#plans" className="flex flex-col items-center gap-1 text-[#bec8d3] opacity-60">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Plans</span>
                </Link>
                <Link href="/diet" className="flex flex-col items-center gap-1 text-[#bec8d3] opacity-60">
                    <Flame className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Diet</span>
                </Link>
                <Link href="/" className="flex flex-col items-center gap-1 text-[#bec8d3] opacity-60">
                    <User className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
                </Link>
            </nav>
        </div>
    );
}
