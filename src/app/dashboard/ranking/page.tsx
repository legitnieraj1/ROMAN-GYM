import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { getMedalData } from "@/app/actions/attendance";
import { computeMedals, type MedalStats } from "@/lib/medals";
import {
    LayoutDashboard, Trophy, User, Zap, Flame, Shield,
    Swords, Medal, Crown, Target, Lock
} from "lucide-react";

function getRank(totalCheckIns: number) {
    if (totalCheckIns >= 100) return "Centurion";
    if (totalCheckIns >= 50) return "Gladiator";
    if (totalCheckIns >= 20) return "Warrior";
    return "Recruit";
}

interface RankedMember {
    id: string;
    name: string;
    photo_url: string | null;
    currentStreak: number;
    totalCheckIns: number;
    avgSessionMinutes: number;
    rank: string;
    medalsUnlocked: number;
}

async function getLeaderboard(): Promise<RankedMember[]> {
    if (!supabaseAdmin) return [];

    // Get all members
    const { data: members } = await supabaseAdmin
        .from("members")
        .select("id, name, photo_url");

    if (!members || members.length === 0) return [];

    // Get all attendance records
    const { data: allAttendance } = await supabaseAdmin
        .from("attendance")
        .select("member_id, date, check_in_time, check_out_time")
        .order("check_in_time", { ascending: false });

    if (!allAttendance) return [];

    // Group attendance by member
    const attendanceByMember = new Map<string, typeof allAttendance>();
    for (const record of allAttendance) {
        const existing = attendanceByMember.get(record.member_id) || [];
        existing.push(record);
        attendanceByMember.set(record.member_id, existing);
    }

    // Calculate stats for each member
    const ranked: RankedMember[] = members.map((member) => {
        const records = attendanceByMember.get(member.id) || [];
        const totalCheckIns = records.length;

        // Calculate current streak
        const dates = new Set<string>();
        let totalDurationMin = 0;
        let validSessions = 0;

        for (const r of records) {
            const dateStr = r.date || r.check_in_time?.split("T")[0];
            if (dateStr) dates.add(dateStr);

            if (r.check_in_time && r.check_out_time) {
                const dur = (new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime()) / (1000 * 60);
                if (dur >= 20) {
                    totalDurationMin += dur;
                    validSessions++;
                }
            }
        }

        // Current streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 730; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split("T")[0];
            if (dates.has(dateStr)) {
                currentStreak++;
            } else {
                if (i === 0) continue;
                break;
            }
        }

        const avgSessionMinutes = validSessions > 0 ? Math.round(totalDurationMin / validSessions) : 0;

        // Quick medal count
        const stats: MedalStats = {
            totalCheckIns, currentStreak, longestStreak: currentStreak,
            previousStreak: 0, avgSessionMinutes,
            longestSessionMinutes: 0, sessions60Plus: 0,
            sessions90Plus: 0, sessions120Plus: 0,
            validSessions, comebackActive: false,
        };
        const { unlocked } = computeMedals(stats);

        return {
            id: member.id,
            name: member.name,
            photo_url: member.photo_url,
            currentStreak,
            totalCheckIns,
            avgSessionMinutes,
            rank: getRank(totalCheckIns),
            medalsUnlocked: unlocked.length,
        };
    });

    // Sort by current streak descending, then total check-ins
    ranked.sort((a, b) => b.currentStreak - a.currentStreak || b.totalCheckIns - a.totalCheckIns);

    return ranked;
}

export default async function RankingPage() {
    const session = await getSession();

    if (!session?.userId) {
        redirect("/login");
    }

    let memberProfile: any = null;
    let medalStats: any = null;

    if (supabaseAdmin) {
        const { data } = await supabaseAdmin
            .from("members")
            .select("*")
            .eq("id", session.userId)
            .single();
        memberProfile = data;

        const mData = await getMedalData(session.userId);
        if (mData) medalStats = mData;
    }

    if (!memberProfile) {
        return (
            <div className="min-h-screen bg-[#131314] text-white flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h1 className="text-2xl font-black uppercase tracking-tight">Profile Not Found</h1>
                    <Link href="/login" className="inline-block px-8 py-3 bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] text-[#00164f]">Re-authenticate</Link>
                </div>
            </div>
        );
    }

    const { totalCheckIns = 0, currentStreak = 0 } = medalStats || {};
    const rank = getRank(totalCheckIns);

    // Get full leaderboard
    const leaderboard = await getLeaderboard();
    const userRankIndex = leaderboard.findIndex((m) => m.id === session.userId);
    const userPosition = userRankIndex >= 0 ? userRankIndex + 1 : null;

    // Top 3 for podium
    const top3 = leaderboard.slice(0, 3);
    // Rest of leaderboard (positions 4+)
    const rest = leaderboard.slice(3, 20);

    const positionColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze
    const positionIcons = ["military_tech", "stars", "award_star"];

    return (
        <div className="bg-[#131314] text-[#e5e2e3] font-['Manrope'] overflow-x-hidden selection:bg-[#b6c4ff] selection:text-[#00287d] min-h-screen relative">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-[#131314]/60 backdrop-blur-md flex justify-between items-center px-6 py-4 shadow-[0_20px_40px_rgba(0,89,255,0.08)]">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <Image src="/logoroman.png" alt="Roman Fitness" width={32} height={32} className="h-8 w-auto" />
                        <span className="text-xl font-black text-[#b6c4ff] italic font-['Space_Grotesk'] uppercase tracking-tighter hidden sm:block">ARENA TERMINAL</span>
                    </Link>
                    <nav className="hidden md:flex gap-6 items-center">
                        <Link href="/dashboard" className="text-[#bec8d3] font-['Space_Grotesk'] font-bold uppercase tracking-tighter hover:bg-[#b6c4ff]/10 transition-colors duration-200 px-3 py-1">Dashboard</Link>
                        <Link href="/dashboard/ranking" className="text-[#b6c4ff] border-b-2 border-[#0059ff] font-['Space_Grotesk'] font-bold uppercase tracking-tighter px-3 py-1">Rankings</Link>
                        <Link href="/diet" className="text-[#bec8d3] font-['Space_Grotesk'] font-bold uppercase tracking-tighter hover:bg-[#b6c4ff]/10 transition-colors duration-200 px-3 py-1">Intel</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 pl-4 border-l border-[#434656]/30">
                        <div className="text-right hidden lg:block">
                            <p className="text-[10px] font-['Space_Grotesk'] font-bold text-[#b6c4ff] tracking-widest leading-none">COMMANDER</p>
                            <p className="text-xs font-bold text-[#e5e2e3] uppercase">{memberProfile.name.split(" ")[0]}</p>
                        </div>
                        {memberProfile.photo_url ? (
                            <img src={memberProfile.photo_url} alt={memberProfile.name} className="w-10 h-10 object-cover grayscale brightness-125 border border-[#b6c4ff]/30" />
                        ) : (
                            <div className="w-10 h-10 bg-[#353436] border border-[#b6c4ff]/30 flex items-center justify-center">
                                <User className="w-5 h-5 text-[#bec8d3]" />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="fixed left-0 h-full w-64 z-40 bg-[#131314] border-r border-[#bec8d3]/15 flex-col pt-24 pb-8 hidden md:flex">
                <div className="px-6 mb-8">
                    <p className="font-['Space_Grotesk'] uppercase font-bold tracking-widest text-xs text-[#0059ff] mb-1">COMMAND</p>
                    <p className="text-xl font-black text-[#b6c4ff] font-['Space_Grotesk'] uppercase truncate">{memberProfile.name}</p>
                </div>
                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard" className="text-[#bec8d3] p-4 w-full flex items-center gap-4 hover:bg-[#bec8d3]/5 hover:text-[#b6c4ff] transition-all">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-['Space_Grotesk'] uppercase font-bold tracking-widest text-xs">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/ranking" className="bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] text-white p-4 w-full flex items-center gap-4">
                        <Trophy className="w-5 h-5" />
                        <span className="font-['Space_Grotesk'] uppercase font-bold tracking-widest text-xs">Rankings</span>
                    </Link>
                    <Link href="/dashboard" className="text-[#bec8d3] p-4 w-full flex items-center gap-4 hover:bg-[#bec8d3]/5 hover:text-[#b6c4ff] transition-all">
                        <User className="w-5 h-5" />
                        <span className="font-['Space_Grotesk'] uppercase font-bold tracking-widest text-xs">Profile</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 pt-24 min-h-screen relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                    {/* Hero Title */}
                    <div className="mb-10 border-l-4 border-[#b6c4ff] pl-6">
                        <h1 className="font-['Space_Grotesk'] font-bold text-4xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-[#e5e2e3]">
                            LEGION <span className="text-[#b6c4ff] italic">RANKINGS</span>
                        </h1>
                        <p className="font-['Manrope'] text-[#bec8d3] mt-2 max-w-xl tracking-tight uppercase text-xs">
                            SURVIVAL IS DATA. THE STRONGEST WILL IS MEASURED IN DAYS CONQUERED. CLIMB THE HIERARCHY OR BE FORGOTTEN.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Leaderboard */}
                        <section className="lg:col-span-8 space-y-4">
                            <div className="flex items-center justify-between mb-4 bg-[#1c1b1c] p-4">
                                <h2 className="font-['Space_Grotesk'] font-bold text-sm sm:text-lg tracking-widest uppercase text-[#e5e2e3]">ACTIVE STREAK ELITE</h2>
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#00daf3] tracking-widest">{leaderboard.length} WARRIORS</span>
                                    <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#8d90a2] tracking-widest uppercase hidden sm:block">LIVE TRACKING</span>
                                </div>
                            </div>

                            {leaderboard.length === 0 ? (
                                <div className="bg-[#2a2a2b] p-12 text-center">
                                    <p className="text-[#bec8d3] opacity-60 text-sm">No warriors have checked in yet. Be the first.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Top ranked members */}
                                    {top3.map((member, i) => {
                                        const isUser = member.id === session.userId;
                                        const color = positionColors[i];
                                        return (
                                            <div key={member.id} className={`group flex items-center p-4 relative overflow-hidden transition-all hover:bg-[#3a393a] ${isUser ? "bg-[#0059ff]/10 border border-[#0059ff]/30" : "bg-[#2a2a2b]"}`}>
                                                <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: color }} />
                                                <div className="w-10 sm:w-12 text-center">
                                                    <span className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl italic" style={{ color }}>
                                                        {String(i + 1).padStart(2, "0")}
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0 ml-3 sm:ml-4 hidden sm:block">
                                                    {member.photo_url ? (
                                                        <img className="w-12 h-12 grayscale brightness-110 object-cover border" style={{ borderColor: `${color}50` }} alt={member.name} src={member.photo_url} />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-[#353436] border flex items-center justify-center" style={{ borderColor: `${color}50` }}>
                                                            <Swords className="w-5 h-5 text-[#bec8d3]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3 sm:ml-6 flex-1 min-w-0">
                                                    <p className="font-['Space_Grotesk'] font-bold uppercase tracking-widest text-[#e5e2e3] text-sm truncate">
                                                        {member.name.toUpperCase()}{isUser ? " (YOU)" : ""}
                                                    </p>
                                                    <p className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase">
                                                        CLASS: {member.rank.toUpperCase()} · {member.medalsUnlocked} MEDALS
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end mr-2 sm:mr-4">
                                                    <span className="font-['Space_Grotesk'] font-black text-lg sm:text-xl tracking-tighter" style={{ color }}>
                                                        {member.currentStreak} DAYS
                                                    </span>
                                                    <span className="text-[9px] font-['Space_Grotesk'] font-bold text-[#8d90a2] tracking-widest">STREAK</span>
                                                </div>
                                                {member.avgSessionMinutes > 0 && (
                                                    <div className="text-right flex-col items-end mr-2 hidden lg:flex">
                                                        <span className="font-['Space_Grotesk'] font-bold text-sm text-[#bec8d3]">{member.avgSessionMinutes}m</span>
                                                        <span className="text-[9px] font-['Space_Grotesk'] font-bold text-[#8d90a2] tracking-widest">AVG</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Ranks 4+ */}
                                    {rest.map((member, i) => {
                                        const pos = i + 4;
                                        const isUser = member.id === session.userId;
                                        return (
                                            <div key={member.id} className={`group flex items-center p-3 sm:p-4 transition-all hover:bg-[#3a393a] ${isUser ? "bg-[#0059ff]/10 border border-[#0059ff]/30" : "bg-[#2a2a2b]"}`}>
                                                <div className="w-10 sm:w-12 text-center">
                                                    <span className="font-['Space_Grotesk'] font-black text-lg text-[#bec8d3] opacity-40 italic">
                                                        {String(pos).padStart(2, "0")}
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0 ml-3 sm:ml-4 hidden sm:block">
                                                    {member.photo_url ? (
                                                        <img className="w-10 h-10 grayscale brightness-110 object-cover border border-[#434656]/30" alt={member.name} src={member.photo_url} />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-[#353436] border border-[#434656]/30 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-[#bec8d3]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3 sm:ml-6 flex-1 min-w-0">
                                                    <p className="font-['Space_Grotesk'] font-bold uppercase tracking-widest text-[#e5e2e3] text-sm truncate">
                                                        {member.name.toUpperCase()}{isUser ? " (YOU)" : ""}
                                                    </p>
                                                    <p className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase">
                                                        {member.rank.toUpperCase()} · {member.medalsUnlocked} MEDALS
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end mr-2 sm:mr-4">
                                                    <span className="font-['Space_Grotesk'] font-black text-lg text-[#b6c4ff] tracking-tighter">{member.currentStreak} DAYS</span>
                                                    <span className="text-[9px] font-['Space_Grotesk'] font-bold text-[#8d90a2] tracking-widest">STREAK</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* User's position if not in top 20 */}
                                    {userPosition && userPosition > 20 && (
                                        <>
                                            <div className="py-4 text-center">
                                                <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#8d90a2] tracking-[0.5em] uppercase">· · ·</span>
                                            </div>
                                            <div className="pt-2 pb-4">
                                                <div className="text-center mb-3">
                                                    <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#8d90a2] tracking-[0.5em] uppercase">YOUR POSITION</span>
                                                </div>
                                                <div className="group flex items-center bg-[#0059ff]/10 border border-[#0059ff]/30 p-4 relative overflow-hidden">
                                                    <div className="w-12 text-center">
                                                        <span className="font-['Space_Grotesk'] font-black text-2xl text-white italic">#{userPosition}</span>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-4 hidden sm:block">
                                                        {memberProfile.photo_url ? (
                                                            <img src={memberProfile.photo_url} alt="You" className="w-12 h-12 object-cover border-2 border-[#b6c4ff]" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-[#201f20] border-2 border-[#b6c4ff] flex items-center justify-center">
                                                                <User className="w-5 h-5 text-[#bec8d3]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 sm:ml-6 flex-1">
                                                        <p className="font-['Space_Grotesk'] font-bold uppercase tracking-widest text-white">{memberProfile.name.toUpperCase()} (YOU)</p>
                                                        <p className="text-[10px] font-['Space_Grotesk'] text-[#b6c4ff] tracking-widest uppercase">CLASS: {rank.toUpperCase()}</p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end mr-4 sm:mr-8">
                                                        <span className="font-['Space_Grotesk'] font-black text-xl text-white tracking-tighter">{currentStreak} DAYS</span>
                                                        <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#b6c4ff] tracking-widest">CURRENT STREAK</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* User's position if in top 20 — show summary below */}
                                    {userPosition && userPosition <= 20 && (
                                        <div className="mt-4 p-4 bg-[#1c1b1c] border-l-2 border-[#0059ff]">
                                            <p className="text-[10px] font-['Space_Grotesk'] font-bold text-[#b6c4ff] tracking-widest uppercase">
                                                You are ranked #{userPosition} of {leaderboard.length} warriors
                                                {userPosition > 1 && ` · ${leaderboard[userPosition - 2].currentStreak - currentStreak} days behind #${userPosition - 1}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Stats Sidebar */}
                        <aside className="lg:col-span-4 space-y-6">
                            {/* Your Stats */}
                            <section className="bg-[#1c1b1c] p-6">
                                <h2 className="font-['Space_Grotesk'] font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#00daf3]" /> YOUR STATS
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase">Position</span>
                                        <span className="font-['Space_Grotesk'] font-black text-xl text-[#b6c4ff]">
                                            #{userPosition || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase">Current Streak</span>
                                        <span className="font-['Space_Grotesk'] font-black text-xl text-[#00daf3]">{currentStreak} DAYS</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase">Total Check-ins</span>
                                        <span className="font-['Space_Grotesk'] font-black text-xl text-[#e5e2e3]">{totalCheckIns}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase">Rank</span>
                                        <span className="font-['Space_Grotesk'] font-bold text-sm text-[#FFD700] uppercase">{rank}</span>
                                    </div>
                                    {medalStats?.avgSessionMinutes > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase">Avg Session</span>
                                            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#e5e2e3]">{medalStats.avgSessionMinutes} min</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress to next rank */}
                                {userPosition && userPosition > 1 && (
                                    <div className="mt-6 p-3 bg-[#0e0e0f]">
                                        <p className="text-[9px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest uppercase mb-2">
                                            TO REACH #{userPosition - 1}
                                        </p>
                                        <div className="h-1.5 w-full bg-[#353436] overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#0059ff] to-[#00daf3]"
                                                style={{
                                                    width: `${Math.min(95, leaderboard[userPosition - 2] ? (currentStreak / leaderboard[userPosition - 2].currentStreak) * 100 : 0)}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-[9px] font-['Space_Grotesk'] text-[#b6c4ff] tracking-widest mt-1">
                                            {leaderboard[userPosition - 2] ? `${leaderboard[userPosition - 2].currentStreak - currentStreak} more days needed` : ""}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Medal Count Summary */}
                            <section className="bg-[#1c1b1c] p-6">
                                <h2 className="font-['Space_Grotesk'] font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <Medal className="w-4 h-4 text-[#FFD700]" /> MEDAL VAULT
                                </h2>
                                {medalStats && (() => {
                                    const stats: MedalStats = medalStats;
                                    const { unlocked, total } = computeMedals(stats);
                                    return (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-['Space_Grotesk'] font-black text-3xl text-[#FFD700]">{unlocked.length}</span>
                                                <span className="text-[10px] font-['Space_Grotesk'] text-[#8d90a2] tracking-widest">/ {total} UNLOCKED</span>
                                            </div>
                                            <div className="h-2 w-full bg-[#353436] mb-4">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#FFD700] to-[#00daf3]"
                                                    style={{ width: `${(unlocked.length / total) * 100}%` }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-5 gap-1">
                                                {unlocked.slice(0, 10).map((m) => (
                                                    <div key={m.id} className="aspect-square bg-[#353436] flex items-center justify-center" title={m.label}>
                                                        <Shield className="w-4 h-4 text-[#00daf3]" />
                                                    </div>
                                                ))}
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                className="block w-full mt-4 py-3 bg-[#353436] text-[#bec8d3] font-['Space_Grotesk'] text-[10px] tracking-[0.3em] font-bold uppercase text-center border border-[#8d90a2]/20 hover:text-white transition-all"
                                            >
                                                VIEW FULL VAULT
                                            </Link>
                                        </div>
                                    );
                                })()}
                            </section>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#131314]/90 backdrop-blur-lg border-t border-[#434656]/20 flex justify-around py-4 px-2 z-50">
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#bec8d3]">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-widest">Dash</span>
                </Link>
                <Link href="/dashboard/ranking" className="flex flex-col items-center gap-1 text-[#b6c4ff]">
                    <Trophy className="w-5 h-5" />
                    <span className="text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-widest">Rank</span>
                </Link>
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#bec8d3]">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-widest">User</span>
                </Link>
            </nav>
        </div>
    );
}
