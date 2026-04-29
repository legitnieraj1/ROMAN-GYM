"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Clock, TrendingUp, Bell, UserCheck, AlertTriangle, IndianRupee, Activity, ChevronRight } from "lucide-react";
import { getMembers, getAttendance, getPayments } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { openWhatsAppReminder } from "@/utils/whatsapp";

function getTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ totalMembers: 0, activeNow: 0, expiringSoon: 0, todayRevenue: 0 });
    const [activityFeed, setActivityFeed] = useState<any[]>([]);
    const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const [membersRes, attendanceRes, paymentsRes] = await Promise.all([
                getMembers(), getAttendance(), getPayments()
            ]);
            const members    = membersRes.success && membersRes.data ? membersRes.data : [];
            const attendance = attendanceRes.success && attendanceRes.data ? attendanceRes.data : [];
            const payments   = paymentsRes.success && paymentsRes.data ? paymentsRes.data : [];

            const totalMembers = members.length;
            const activeNow = attendance.filter((a: any) => {
                const checkIn = new Date(a.check_in_time);
                return checkIn > new Date(Date.now() - 2 * 60 * 60 * 1000);
            }).length;

            const expiringList = members.filter((m: any) => {
                if (!m.membership || m.membership.status !== "ACTIVE") return false;
                const endDate = new Date(m.membership.end_date);
                return endDate > new Date() && endDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            }).sort((a: any, b: any) =>
                new Date(a.membership.end_date).getTime() - new Date(b.membership.end_date).getTime()
            );

            const todayRevenue = payments
                .filter((p: any) => {
                    const d = new Date(p.created_at); const t = new Date();
                    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
                })
                .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

            const checkins = attendance.map((a: any) => ({
                type: "checkin", name: a.member?.name || "Unknown", action: "checked in",
                time: new Date(a.check_in_time), amount: 0
            }));
            const recentPayments = payments.map((p: any) => ({
                type: "payment", name: p.member?.name || "Unknown", action: "renewed membership",
                time: new Date(p.created_at), amount: p.amount
            }));
            const combinedFeed = [...checkins, ...recentPayments]
                .sort((a, b) => b.time.getTime() - a.time.getTime())
                .slice(0, 8)
                .map(item => ({ ...item, timeStr: getTimeAgo(item.time) }));

            setActivityFeed(combinedFeed);
            setExpiringMembers(expiringList.slice(0, 6));
            setStats({ totalMembers, activeNow, expiringSoon: expiringList.length, todayRevenue });
            setLoading(false);
        }
        fetchStats();
    }, []);

    const kpis = [
        {
            label: "Total Members",
            value: stats.totalMembers,
            icon: Users,
            accent: "#E8192B",
            description: "Registered warriors",
        },
        {
            label: "Active Now",
            value: stats.activeNow,
            icon: Activity,
            accent: "#22c55e",
            description: "In the last 2 hours",
        },
        {
            label: "Expiring Soon",
            value: stats.expiringSoon,
            icon: AlertTriangle,
            accent: "#f59e0b",
            description: "Within 7 days",
        },
        {
            label: "Today's Revenue",
            value: `₹${stats.todayRevenue.toLocaleString("en-IN")}`,
            icon: IndianRupee,
            accent: "#E8192B",
            description: "Payments received",
        },
    ];

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                <div>
                    <p className="text-[#E8192B] text-[9px] tracking-[0.5em] uppercase font-semibold mb-1">Admin Panel</p>
                    <h1 className="font-heading text-3xl md:text-4xl uppercase tracking-wider text-white">Arena Control</h1>
                    <p className="text-white/25 text-xs mt-1 tracking-wide">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>
                <div className="flex gap-2.5">
                    <button
                        onClick={() => router.push("/admin/members")}
                        className="group relative px-5 py-2.5 bg-[#E8192B] text-white font-bold text-xs uppercase tracking-[0.2em] overflow-hidden transition-shadow hover:shadow-[0_0_30px_rgba(232,25,43,0.4)] flex items-center gap-2"
                    >
                        <UserPlus size={14} />
                        Add Member
                        <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                    </button>
                    <button
                        onClick={() => alert("Broadcast feature coming soon!")}
                        className="px-5 py-2.5 bg-transparent text-white/50 font-bold text-xs uppercase tracking-[0.2em] border border-white/[0.08] hover:border-[#E8192B]/30 hover:text-white transition-all flex items-center gap-2"
                    >
                        <Bell size={14} />
                        Broadcast
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-[#0f0f0f] border border-white/[0.06] p-5 relative overflow-hidden hover:border-white/10 transition-colors"
                        style={{ borderTopColor: kpi.accent, borderTopWidth: "2px" }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-8 h-8 flex items-center justify-center"
                                style={{ background: `${kpi.accent}18` }}
                            >
                                <kpi.icon className="w-4 h-4" style={{ color: kpi.accent }} />
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 text-right">{kpi.label}</p>
                        </div>
                        <p className="font-heading text-2xl md:text-3xl tracking-wider text-white leading-none">
                            {loading ? <span className="text-white/20">—</span> : kpi.value}
                        </p>
                        <p className="text-[9px] text-white/20 uppercase tracking-wider mt-1.5">{kpi.description}</p>
                    </div>
                ))}
            </div>

            {/* ── Content Grid ── */}
            <div className="grid gap-4 lg:grid-cols-7">

                {/* Activity Feed */}
                <div className="lg:col-span-4 bg-[#0f0f0f] border border-white/[0.06] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-0.5 h-4 bg-[#E8192B]" />
                            <h2 className="font-heading text-base uppercase tracking-wider text-white">Live Activity</h2>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] text-green-400 uppercase tracking-wider font-bold">Live</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="h-12 bg-white/[0.03] animate-pulse" />
                            ))
                        ) : activityFeed.length === 0 ? (
                            <div className="text-center py-10">
                                <Activity className="w-8 h-8 text-white/10 mx-auto mb-2" />
                                <p className="text-white/20 text-sm">No recent activity</p>
                            </div>
                        ) : (
                            activityFeed.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-[#080808] border border-white/[0.03] hover:border-white/[0.07] transition-colors">
                                    <div
                                        className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${
                                            item.type === "checkin"
                                                ? "bg-green-500/10 border border-green-500/20"
                                                : "bg-[#E8192B]/10 border border-[#E8192B]/20"
                                        }`}
                                    >
                                        {item.type === "checkin"
                                            ? <UserCheck size={13} className="text-green-400" />
                                            : <Clock size={13} className="text-[#E8192B]" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white/75 truncate">
                                            {item.name}
                                            <span className="text-white/25 font-normal"> {item.action}</span>
                                        </p>
                                        <p className="text-[9px] text-white/20 uppercase tracking-wider">{item.timeStr}</p>
                                    </div>
                                    {item.amount > 0 && (
                                        <span className="text-xs font-bold text-[#E8192B] whitespace-nowrap">
                                            +₹{item.amount.toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Expiring Members */}
                <div className="lg:col-span-3 bg-[#0f0f0f] border border-white/[0.06] p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-0.5 h-4 bg-amber-500" />
                        <h2 className="font-heading text-base uppercase tracking-wider text-white">Expiring Soon</h2>
                        {!loading && stats.expiringSoon > 0 && (
                            <span className="ml-auto bg-amber-500/15 text-amber-400 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border border-amber-500/20">
                                {stats.expiringSoon} members
                            </span>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-14 bg-white/[0.03] animate-pulse" />
                            ))
                        ) : expiringMembers.length === 0 ? (
                            <div className="text-center py-10">
                                <AlertTriangle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                                <p className="text-white/20 text-sm">No upcoming expiries</p>
                            </div>
                        ) : (
                            expiringMembers.map((member, i) => {
                                const daysLeft = Math.ceil(
                                    (new Date(member.membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                );
                                const urgency = daysLeft <= 2 ? "text-[#E8192B]" : daysLeft <= 4 ? "text-amber-400" : "text-amber-300";
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 bg-[#080808] border border-white/[0.04] hover:border-amber-500/20 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400 flex-shrink-0">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white/80 truncate">{member.name}</p>
                                                <p className={`text-[9px] font-bold uppercase tracking-wider ${urgency}`}>{daysLeft}d left</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openWhatsAppReminder(member)}
                                            disabled={!member.phone}
                                            className="ml-2 text-[9px] bg-green-500/10 hover:bg-green-500/20 text-green-400 px-2.5 py-1.5 border border-green-500/20 transition-colors disabled:opacity-30 uppercase tracking-wider font-bold whitespace-nowrap flex-shrink-0"
                                        >
                                            Remind
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
