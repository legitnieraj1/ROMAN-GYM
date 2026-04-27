"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Clock, TrendingUp, Bell, UserCheck, AlertTriangle } from "lucide-react";
import { getMembers, getAttendance, getPayments } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { openWhatsAppReminder } from "@/utils/whatsapp";

function getTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
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
            }).sort((a: any, b: any) => new Date(a.membership.end_date).getTime() - new Date(b.membership.end_date).getTime());

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
                .slice(0, 5)
                .map(item => ({ ...item, timeStr: getTimeAgo(item.time) }));

            setActivityFeed(combinedFeed);
            setExpiringMembers(expiringList.slice(0, 5));
            setStats({ totalMembers, activeNow, expiringSoon: expiringList.length, todayRevenue });
            setLoading(false);
        }
        fetchStats();
    }, []);

    const kpis = [
        { label: "Total Members",   value: stats.totalMembers,    prefix: "",     icon: Users,         accent: "#E8192B", textColor: "text-white" },
        { label: "Active Now",      value: stats.activeNow,       prefix: "",     icon: TrendingUp,    accent: "#22c55e", textColor: "text-green-400" },
        { label: "Expiring Soon",   value: stats.expiringSoon,    prefix: "",     icon: AlertTriangle, accent: "#f59e0b", textColor: "text-amber-400" },
        { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, prefix: "", icon: null, accent: "#E8192B", textColor: "text-[#E8192B]" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
                <div>
                    <p className="text-[#E8192B] text-[10px] tracking-[0.45em] uppercase font-medium mb-1">Admin Panel</p>
                    <h1 className="font-heading text-4xl uppercase tracking-wider text-white">Arena Control</h1>
                    <p className="text-white/25 text-sm mt-1">Overview of today&apos;s performance.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push("/admin/members")}
                        className="group relative px-5 py-2.5 bg-[#E8192B] text-white font-bold text-xs uppercase tracking-[0.2em] overflow-hidden transition-shadow hover:shadow-[0_0_30px_rgba(232,25,43,0.4)] flex items-center gap-2"
                    >
                        <UserPlus size={15} /> Add Member
                        <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                    </button>
                    <button
                        onClick={() => alert("Broadcast feature coming soon!")}
                        className="px-5 py-2.5 bg-white/[0.04] text-white/60 font-bold text-xs uppercase tracking-[0.2em] border border-white/[0.06] hover:border-[#E8192B]/30 hover:text-white transition-all flex items-center gap-2"
                    >
                        <Bell size={15} /> Broadcast
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-[#0f0f0f] border border-white/[0.06] p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
                        style={{ borderLeftColor: kpi.accent, borderLeftWidth: 2 }}>
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">{kpi.label}</p>
                            {kpi.icon && <kpi.icon className="h-4 w-4" style={{ color: kpi.accent }} />}
                        </div>
                        <p className={`font-heading text-3xl tracking-wider ${kpi.textColor}`}>
                            {loading ? "—" : kpi.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Activity Feed */}
                <div className="col-span-4 bg-[#0f0f0f] border border-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-[2px] h-5 bg-[#E8192B]" />
                        <h2 className="font-heading text-lg uppercase tracking-wider text-white">Live Activity Feed</h2>
                    </div>
                    <div className="space-y-5">
                        {loading ? (
                            <p className="text-white/25 text-sm">Loading activity...</p>
                        ) : activityFeed.length === 0 ? (
                            <p className="text-white/25 text-sm">No recent activity.</p>
                        ) : (
                            activityFeed.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`h-8 w-8 flex items-center justify-center border ${
                                        item.type === "checkin"
                                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                                            : "border-[#E8192B]/20 bg-[#E8192B]/10 text-[#E8192B]"
                                    }`}>
                                        {item.type === "checkin" ? <UserCheck size={14} /> : <Clock size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white/80 truncate">
                                            {item.name} <span className="text-white/30 font-normal">{item.action}</span>
                                        </p>
                                        <p className="text-[10px] text-white/20 tracking-wider uppercase">{item.timeStr}</p>
                                    </div>
                                    {item.amount > 0 && (
                                        <span className="text-xs font-bold text-[#E8192B] whitespace-nowrap">
                                            +₹{item.amount.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Expiring Members */}
                <div className="col-span-3 bg-[#0f0f0f] border border-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-[2px] h-5 bg-amber-500" />
                        <h2 className="font-heading text-lg uppercase tracking-wider text-white">Expiring Soon</h2>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-white/25 text-sm">Loading...</p>
                        ) : expiringMembers.length === 0 ? (
                            <p className="text-white/25 text-sm">No upcoming expiries.</p>
                        ) : (
                            expiringMembers.map((member, i) => {
                                const daysLeft = Math.ceil((new Date(member.membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 bg-[#080808] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-[#E8192B]/10 border border-[#E8192B]/20 flex items-center justify-center text-[10px] font-bold text-[#E8192B]">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white/80">{member.name}</p>
                                                <p className="text-[10px] text-amber-400 uppercase tracking-wider">{daysLeft}d left</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openWhatsAppReminder(member)}
                                            disabled={!member.phone}
                                            className="text-[10px] bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 border border-green-500/20 transition-colors disabled:opacity-40 uppercase tracking-wider font-bold"
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
