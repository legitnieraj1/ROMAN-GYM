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
            <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h1 className="text-2xl font-black uppercase tracking-tight">Profile Not Found</h1>
                    <Link href="/login" className="inline-block px-8 py-3 bg-[#E8192B] text-white">Re-authenticate</Link>
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
        <div className="bg-[#080808] text-[rgba(255,255,255,0.85)] font-sans overflow-x-hidden selection:bg-[#E8192B] selection:text-white min-h-screen relative">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-[#080808]/60 backdrop-blur-md flex justify-between items-center px-6 py-4 shadow-[0_20px_40px_rgba(232,25,43,0.15)]">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <Image src="/logoroman.png" alt="Roman Fitness" width={32} height={32} className="h-8 w-auto" />
                        <span className="text-xl font-black text-[#E8192B] italic font-heading uppercase tracking-tighter hidden sm:block">ARENA TERMINAL</span>
                    </Link>
                    <nav className="hidden md:flex gap-6 items-center">
                        <Link href="/dashboard" className="text-[rgba(255,255,255,0.4)] font-heading font-bold uppercase tracking-tighter hover:bg-[#E8192B]/10 transition-colors duration-200 px-3 py-1">Dashboard</Link>
                        <Link href="/dashboard/ranking" className="text-[#E8192B] border-b-2 border-[#E8192B] font-heading font-bold uppercase tracking-tighter px-3 py-1">Rankings</Link>
                        <Link href="/diet" className="text-[rgba(255,255,255,0.4)] font-heading font-bold uppercase tracking-tighter hover:bg-[#E8192B]/10 transition-colors duration-200 px-3 py-1">Intel</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]/30">
                        <div className="text-right hidden lg:block">
                            <p className="text-[10px] font-heading font-bold text-[#E8192B] tracking-widest leading-none">COMMANDER</p>
                            <p className="text-xs font-bold text-[rgba(255,255,255,0.85)] uppercase">{memberProfile.name.split(" ")[0]}</p>
                        </div>
                        {memberProfile.photo_url ? (
                            <img src={memberProfile.photo_url} alt={memberProfile.name} className="w-10 h-10 object-cover grayscale brightness-125 border border-[#E8192B]/30" />
                        ) : (
                            <div className="w-10 h-10 bg-[#1a1a1a] border border-[#E8192B]/30 flex items-center justify-center">
                                <User className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="fixed left-0 h-full w-64 z-40 bg-[#080808] border-r border-[rgba(255,255,255,0.4)]/15 flex-col pt-24 pb-8 hidden md:flex">
                <div className="px-6 mb-8">
                    <p className="font-heading uppercase font-bold tracking-widest text-xs text-[#E8192B] mb-1">COMMAND</p>
                    <p className="text-xl font-black text-[#E8192B] font-heading uppercase truncate">{memberProfile.name}</p>
                </div>
                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard" className="text-[rgba(255,255,255,0.4)] p-4 w-full flex items-center gap-4 hover:bg-[rgba(255,255,255,0.4)]/5 hover:text-[#E8192B] transition-all">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-heading uppercase font-bold tracking-widest text-xs">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/ranking" className="bg-[#E8192B] text-white p-4 w-full flex items-center gap-4">
                        <Trophy className="w-5 h-5" />
                        <span className="font-heading uppercase font-bold tracking-widest text-xs">Rankings</span>
                    </Link>
                    <Link href="/dashboard" className="text-[rgba(255,255,255,0.4)] p-4 w-full flex items-center gap-4 hover:bg-[rgba(255,255,255,0.4)]/5 hover:text-[#E8192B] transition-all">
                        <User className="w-5 h-5" />
                        <span className="font-heading uppercase font-bold tracking-widest text-xs">Profile</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 pt-24 min-h-screen relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                    {/* Hero Title */}
                    <div className="mb-10 border-l-4 border-[#E8192B] pl-6">
                        <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-[rgba(255,255,255,0.85)]">
                            LEGION <span className="text-[#E8192B] italic">RANKINGS</span>
                        </h1>
                        <p className="font-sans text-[rgba(255,255,255,0.4)] mt-2 max-w-xl tracking-tight uppercase text-xs">
                            SURVIVAL IS DATA. THE STRONGEST WILL IS MEASURED IN DAYS CONQUERED. CLIMB THE HIERARCHY OR BE FORGOTTEN.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Leaderboard */}
                        <section className="lg:col-span-8 space-y-4">
                            <div className="flex items-center justify-between mb-4 bg-[#0d0d0d] p-4">
                                <h2 className="font-heading font-bold text-sm sm:text-lg tracking-widest uppercase text-[rgba(255,255,255,0.85)]">ACTIVE STREAK ELITE</h2>
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-heading font-bold text-[#E8192B] tracking-widest">{leaderboard.length} WARRIORS</span>
                                    <span className="text-[10px] font-heading font-bold text-[rgba(255,255,255,0.3)] tracking-widest uppercase hidden sm:block">LIVE TRACKING</span>
                                </div>
                            </div>

                            {leaderboard.length === 0 ? (
                                <div className="bg-[#111111] p-12 text-center">
                                    <p className="text-[rgba(255,255,255,0.4)] opacity-60 text-sm">No warriors have checked in yet. Be the first.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Top ranked members */}
                                    {top3.map((member, i) => {
                                        const isUser = member.id === session.userId;
                                        const color = positionColors[i];
                                        return (
                                            <div key={member.id} className={`group flex items-center p-4 relative overflow-hidden transition-all hover:bg-white/[0.03] ${isUser ? "bg-[#E8192B]/10 border border-[#E8192B]/30" : "bg-[#111111]"}`}>
                                                <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: color }} />
                                                <div className="w-10 sm:w-12 text-center">
                                                    <span className="font-heading font-black text-xl sm:text-2xl italic" style={{ color }}>
                                                        {String(i + 1).padStart(2, "0")}
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0 ml-3 sm:ml-4 hidden sm:block">
                                                    {member.photo_url ? (
                                                        <img className="w-12 h-12 grayscale brightness-110 object-cover border" style={{ borderColor: `${color}50` }} alt={member.name} src={member.photo_url} />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-[#1a1a1a] border flex items-center justify-center" style={{ borderColor: `${color}50` }}>
                                                            <Swords className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3 sm:ml-6 flex-1 min-w-0">
                                                    <p className="font-heading font-bold uppercase tracking-widest text-[rgba(255,255,255,0.85)] text-sm truncate">
                                                        {member.name.toUpperCase()}{isUser ? " (YOU)" : ""}
                                                    </p>
                                                    <p className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase">
                                                        CLASS: {member.rank.toUpperCase()} · {member.medalsUnlocked} MEDALS
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end mr-2 sm:mr-4">
                                                    <span className="font-heading font-black text-lg sm:text-xl tracking-tighter" style={{ color }}>
                                                        {member.currentStreak} DAYS
                                                    </span>
                                                    <span className="text-[9px] font-heading font-bold text-[rgba(255,255,255,0.3)] tracking-widest">STREAK</span>
                                                </div>
                                                {member.avgSessionMinutes > 0 && (
                                                    <div className="text-right flex-col items-end mr-2 hidden lg:flex">
                                                        <span className="font-heading font-bold text-sm text-[rgba(255,255,255,0.4)]">{member.avgSessionMinutes}m</span>
                                                        <span className="text-[9px] font-heading font-bold text-[rgba(255,255,255,0.3)] tracking-widest">AVG</span>
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
                                            <div key={member.id} className={`group flex items-center p-3 sm:p-4 transition-all hover:bg-white/[0.03] ${isUser ? "bg-[#E8192B]/10 border border-[#E8192B]/30" : "bg-[#111111]"}`}>
                                                <div className="w-10 sm:w-12 text-center">
                                                    <span className="font-heading font-black text-lg text-[rgba(255,255,255,0.4)] opacity-40 italic">
                                                        {String(pos).padStart(2, "0")}
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0 ml-3 sm:ml-4 hidden sm:block">
                                                    {member.photo_url ? (
                                                        <img className="w-10 h-10 grayscale brightness-110 object-cover border border-white/[0.06]/30" alt={member.name} src={member.photo_url} />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-[#1a1a1a] border border-white/[0.06]/30 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3 sm:ml-6 flex-1 min-w-0">
                                                    <p className="font-heading font-bold uppercase tracking-widest text-[rgba(255,255,255,0.85)] text-sm truncate">
                                                        {member.name.toUpperCase()}{isUser ? " (YOU)" : ""}
                                                    </p>
                                                    <p className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase">
                                                        {member.rank.toUpperCase()} · {member.medalsUnlocked} MEDALS
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end mr-2 sm:mr-4">
                                                    <span className="font-heading font-black text-lg text-[#E8192B] tracking-tighter">{member.currentStreak} DAYS</span>
                                                    <span className="text-[9px] font-heading font-bold text-[rgba(255,255,255,0.3)] tracking-widest">STREAK</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* User's position if not in top 20 */}
                                    {userPosition && userPosition > 20 && (
                                        <>
                                            <div className="py-4 text-center">
                                                <span className="text-[10px] font-heading font-bold text-[rgba(255,255,255,0.3)] tracking-[0.5em] uppercase">· · ·</span>
                                            </div>
                                            <div className="pt-2 pb-4">
                                                <div className="text-center mb-3">
                                                    <span className="text-[10px] font-heading font-bold text-[rgba(255,255,255,0.3)] tracking-[0.5em] uppercase">YOUR POSITION</span>
                                                </div>
                                                <div className="group flex items-center bg-[#E8192B]/10 border border-[#E8192B]/30 p-4 relative overflow-hidden">
                                                    <div className="w-12 text-center">
                                                        <span className="font-heading font-black text-2xl text-white italic">#{userPosition}</span>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-4 hidden sm:block">
                                                        {memberProfile.photo_url ? (
                                                            <img src={memberProfile.photo_url} alt="You" className="w-12 h-12 object-cover border-2 border-[#E8192B]" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-[#0f0f0f] border-2 border-[#E8192B] flex items-center justify-center">
                                                                <User className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 sm:ml-6 flex-1">
                                                        <p className="font-heading font-bold uppercase tracking-widest text-white">{memberProfile.name.toUpperCase()} (YOU)</p>
                                                        <p className="text-[10px] font-heading text-[#E8192B] tracking-widest uppercase">CLASS: {rank.toUpperCase()}</p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end mr-4 sm:mr-8">
                                                        <span className="font-heading font-black text-xl text-white tracking-tighter">{currentStreak} DAYS</span>
                                                        <span className="text-[10px] font-heading font-bold text-[#E8192B] tracking-widest">CURRENT STREAK</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* User's position if in top 20 — show summary below */}
                                    {userPosition && userPosition <= 20 && (
                                        <div className="mt-4 p-4 bg-[#0d0d0d] border-l-2 border-[#E8192B]">
                                            <p className="text-[10px] font-heading font-bold text-[#E8192B] tracking-widest uppercase">
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
                            <section className="bg-[#0d0d0d] p-6">
                                <h2 className="font-heading font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#E8192B]" /> YOUR STATS
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase">Position</span>
                                        <span className="font-heading font-black text-xl text-[#E8192B]">
                                            #{userPosition || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase">Current Streak</span>
                                        <span className="font-heading font-black text-xl text-[#E8192B]">{currentStreak} DAYS</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase">Total Check-ins</span>
                                        <span className="font-heading font-black text-xl text-[rgba(255,255,255,0.85)]">{totalCheckIns}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase">Rank</span>
                                        <span className="font-heading font-bold text-sm text-[#FFD700] uppercase">{rank}</span>
                                    </div>
                                    {medalStats?.avgSessionMinutes > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase">Avg Session</span>
                                            <span className="font-heading font-bold text-sm text-[rgba(255,255,255,0.85)]">{medalStats.avgSessionMinutes} min</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress to next rank */}
                                {userPosition && userPosition > 1 && (
                                    <div className="mt-6 p-3 bg-[#080808]">
                                        <p className="text-[9px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest uppercase mb-2">
                                            TO REACH #{userPosition - 1}
                                        </p>
                                        <div className="h-1.5 w-full bg-[#1a1a1a] overflow-hidden">
                                            <div
                                                className="h-full bg-[#E8192B]"
                                                style={{
                                                    width: `${Math.min(95, leaderboard[userPosition - 2] ? (currentStreak / leaderboard[userPosition - 2].currentStreak) * 100 : 0)}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-[9px] font-heading text-[#E8192B] tracking-widest mt-1">
                                            {leaderboard[userPosition - 2] ? `${leaderboard[userPosition - 2].currentStreak - currentStreak} more days needed` : ""}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Medal Count Summary */}
                            <section className="bg-[#0d0d0d] p-6">
                                <h2 className="font-heading font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                                    <Medal className="w-4 h-4 text-[#FFD700]" /> MEDAL VAULT
                                </h2>
                                {medalStats && (() => {
                                    const stats: MedalStats = medalStats;
                                    const { unlocked, total } = computeMedals(stats);
                                    return (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-heading font-black text-3xl text-[#FFD700]">{unlocked.length}</span>
                                                <span className="text-[10px] font-heading text-[rgba(255,255,255,0.3)] tracking-widest">/ {total} UNLOCKED</span>
                                            </div>
                                            <div className="h-2 w-full bg-[#1a1a1a] mb-4">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#FFD700] to-[#E8192B]"
                                                    style={{ width: `${(unlocked.length / total) * 100}%` }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-5 gap-1">
                                                {unlocked.slice(0, 10).map((m) => (
                                                    <div key={m.id} className="aspect-square bg-[#1a1a1a] flex items-center justify-center" title={m.label}>
                                                        <Shield className="w-4 h-4 text-[#E8192B]" />
                                                    </div>
                                                ))}
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                className="block w-full mt-4 py-3 bg-[#1a1a1a] text-[rgba(255,255,255,0.4)] font-heading text-[10px] tracking-[0.3em] font-bold uppercase text-center border border-[rgba(255,255,255,0.3)]/20 hover:text-white transition-all"
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
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#080808]/90 backdrop-blur-lg border-t border-white/[0.06]/20 flex justify-around py-4 px-2 z-50">
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[rgba(255,255,255,0.4)]">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[10px] font-heading font-bold uppercase tracking-widest">Dash</span>
                </Link>
                <Link href="/dashboard/ranking" className="flex flex-col items-center gap-1 text-[#E8192B]">
                    <Trophy className="w-5 h-5" />
                    <span className="text-[10px] font-heading font-bold uppercase tracking-widest">Rank</span>
                </Link>
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[rgba(255,255,255,0.4)]">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-heading font-bold uppercase tracking-widest">User</span>
                </Link>
            </nav>
        </div>
    );
}
