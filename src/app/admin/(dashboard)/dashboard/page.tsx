"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Clock, TrendingUp, Bell, UserCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMembers, getAttendance, getPayments } from "@/app/actions/admin";

import { useRouter } from "next/navigation";
import { openWhatsAppReminder } from "@/utils/whatsapp";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeNow: 0,
        expiringSoon: 0,
        todayRevenue: 0
    });
    const [activityFeed, setActivityFeed] = useState<any[]>([]);
    const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        async function fetchStats() {
            const [membersRes, attendanceRes, paymentsRes] = await Promise.all([
                getMembers(),
                getAttendance(),
                getPayments()
            ]);

            const members = membersRes.success && membersRes.data ? membersRes.data : [];
            const attendance = attendanceRes.success && attendanceRes.data ? attendanceRes.data : [];
            const payments = paymentsRes.success && paymentsRes.data ? paymentsRes.data : [];

            // Calculate stats
            const totalMembers = members.length;
            // Mocking "Active Now" based on recent check-ins within last 2 hours
            const activeNow = attendance.filter((a: any) => {
                const checkIn = new Date(a.check_in_time);
                const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
                return checkIn > twoHoursAgo;
            }).length;

            const expiringList = members.filter((m: any) => {
                if (!m.membership || m.membership.status !== 'ACTIVE') return false;
                const endDate = new Date(m.membership.end_date);
                const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                return endDate > new Date() && endDate < sevenDaysFromNow;
            }).sort((a: any, b: any) => new Date(a.membership.end_date).getTime() - new Date(b.membership.end_date).getTime());

            const expiringSoon = expiringList.length;

            const todayRevenue = payments
                .filter((p: any) => {
                    const paymentDate = new Date(p.created_at);
                    const today = new Date();
                    return paymentDate.getDate() === today.getDate() &&
                        paymentDate.getMonth() === today.getMonth() &&
                        paymentDate.getFullYear() === today.getFullYear();
                })
                .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

            // Format Activity Feed
            // 1. Attendance Check-ins
            const checkins = attendance.map((a: any) => ({
                type: 'checkin',
                name: a.member?.name || "Unknown Member",
                action: "checked in",
                time: new Date(a.check_in_time),
                amount: 0
            }));

            // 2. Payments
            const recentPayments = payments.map((p: any) => ({
                type: 'payment',
                name: p.member?.name || "Unknown Member",
                action: "renewed membership",
                time: new Date(p.created_at),
                amount: p.amount
            }));

            // Combine and Sort
            const combinedFeed = [...checkins, ...recentPayments]
                .sort((a, b) => b.time.getTime() - a.time.getTime())
                .slice(0, 5) // Top 5
                .map(item => ({
                    ...item,
                    timeStr: getTimeAgo(item.time)
                }));

            setActivityFeed(combinedFeed);
            setExpiringMembers(expiringList.slice(0, 5)); // Top 5 expiring

            setStats({
                totalMembers,
                activeNow,
                expiringSoon,
                todayRevenue
            });
            setLoading(false);
        }

        fetchStats();
    }, []);



    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white">Arena Control</h1>
                    <p className="text-[#b6c4ff]/60">Overview of your arena&apos;s performance today.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/admin/members')}
                        className="px-4 py-2 bg-[#0059ff] text-white rounded-lg font-bold hover:bg-[#0059ff]/90 transition-colors shadow-[0_0_15px_-5px_#0059ff] flex items-center gap-2"
                    >
                        <UserPlus size={18} /> Add Member
                    </button>
                    <button
                        onClick={() => alert("Broadcast feature coming soon! (v3.0)")}
                        className="px-4 py-2 bg-[#2a2a2b] text-white rounded-lg font-bold hover:bg-[#2a2a2b]/80 transition-colors border border-white/10 flex items-center gap-2"
                    >
                        <Bell size={18} /> BroadCast
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#2a2a2b] border-l-2 border-[#0059ff] hover:border-[#0059ff]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-[#b6c4ff]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{loading ? "..." : stats.totalMembers}</div>
                        <p className="text-xs text-zinc-500">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#2a2a2b] border-l-2 border-[#00daf3] hover:border-[#00daf3]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400">Active Now</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#00daf3]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-[#00daf3]">{loading ? "..." : stats.activeNow}</div>
                        <p className="text-xs text-zinc-500">Currently in arena</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#2a2a2b] border-l-2 border-[#ffb4ab] hover:border-[#ffb4ab]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400">Expiring Soon</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-[#ffb4ab]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-[#ffb4ab]">{loading ? "..." : stats.expiringSoon}</div>
                        <p className="text-xs text-zinc-500">Within next 7 days</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#2a2a2b] border-l-2 border-[#b6c4ff] hover:border-[#b6c4ff]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400">Today&apos;s Revenue</CardTitle>
                        <div className="font-bold text-[#b6c4ff]">Rs.</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{loading ? "..." : `Rs. ${stats.todayRevenue.toLocaleString()}`}</div>
                        <p className="text-xs text-zinc-500">Daily earnings</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4 bg-[#2a2a2b] border-[#131314]">
                    <CardHeader>
                        <CardTitle className="text-white font-black uppercase tracking-wider">Live Activity Feed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {loading ? (
                                <p className="text-zinc-500 text-sm">Loading activity...</p>
                            ) : activityFeed.length === 0 ? (
                                <p className="text-zinc-500 text-sm">No recent activity.</p>
                            ) : (
                                activityFeed.map((item, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center border border-white/10 ${item.type === 'checkin' ? 'bg-[#00daf3]/10 text-[#00daf3]' :
                                            item.type === 'payment' ? 'bg-[#b6c4ff]/10 text-[#b6c4ff]' :
                                                item.type === 'alert' ? 'bg-[#ffb4ab]/10 text-[#ffb4ab]' :
                                                    'bg-zinc-800 text-white'
                                            }`}>
                                            {item.type === 'checkin' ? <UserCheck size={16} /> :
                                                item.type === 'alert' ? <AlertTriangle size={16} /> :
                                                    <Clock size={16} />}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none text-white">
                                                {item.name} <span className="text-zinc-500 font-normal">{item.action}</span>
                                            </p>
                                            <p className="text-xs text-[#b6c4ff]/40">{item.timeStr}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-zinc-500">
                                            {item.amount ? `+ Rs. ${item.amount.toLocaleString()}` : ""}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Signups / Alerts */}
                <Card className="col-span-3 bg-[#2a2a2b] border-[#131314]">
                    <CardHeader>
                        <CardTitle className="text-white font-black uppercase tracking-wider">Expiring Approaching</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-zinc-500 text-sm">Loading...</p>
                            ) : expiringMembers.length === 0 ? (
                                <p className="text-zinc-500 text-sm">No upcoming expiries.</p>
                            ) : (
                                expiringMembers.map((member, i) => {
                                    const daysLeft = Math.ceil((new Date(member.membership.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 bg-[#131314]/60 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#131314] flex items-center justify-center text-xs text-zinc-400">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{member.name}</div>
                                                    <div className="text-xs text-[#ffb4ab]">Expires in {daysLeft} days</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openWhatsAppReminder(member)}
                                                disabled={!member.phone}
                                                title={!member.phone ? "Phone number not available" : "Send Reminder via WhatsApp"}
                                                className="text-xs bg-green-600/20 hover:bg-green-600/40 text-green-500 hover:text-green-400 px-3 py-1.5 rounded transition-colors border border-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Remind
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
