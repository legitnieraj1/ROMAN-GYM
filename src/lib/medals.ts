// Full medal/achievement system for Roman Fitness Arena

export type MedalCategory = "streak" | "duration" | "combo" | "discipline" | "comeback";

export interface Medal {
    id: string;
    label: string;
    desc: string;
    category: MedalCategory;
    categoryLabel: string;
    icon: string; // lucide icon name
    tier: number; // 1=bronze, 2=silver, 3=gold, 4=platinum, 5=legendary
    check: (stats: MedalStats) => boolean;
    progress: (stats: MedalStats) => { current: number; target: number; label: string };
}

export interface MedalStats {
    totalCheckIns: number;
    currentStreak: number;
    longestStreak: number;
    previousStreak: number;
    avgSessionMinutes: number;
    longestSessionMinutes: number;
    sessions60Plus: number;
    sessions90Plus: number;
    sessions120Plus: number;
    validSessions: number;
    comebackActive: boolean;
}

export const ALL_MEDALS: Medal[] = [
    // ── STREAK MEDALS ──
    {
        id: "first_blood", label: "First Blood", desc: "Complete your first workout",
        category: "streak", categoryLabel: "Streak", icon: "swords", tier: 1,
        check: (s) => s.totalCheckIns >= 1,
        progress: (s) => ({ current: Math.min(s.totalCheckIns, 1), target: 1, label: "1 workout" }),
    },
    {
        id: "initiated", label: "Initiated", desc: "3-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "flame", tier: 1,
        check: (s) => s.longestStreak >= 3,
        progress: (s) => ({ current: Math.min(s.currentStreak, 3), target: 3, label: "3 day streak" }),
    },
    {
        id: "iron_habit", label: "Iron Habit", desc: "7-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "shield", tier: 2,
        check: (s) => s.longestStreak >= 7,
        progress: (s) => ({ current: Math.min(s.currentStreak, 7), target: 7, label: "7 day streak" }),
    },
    {
        id: "discipline_core", label: "Discipline Core", desc: "14-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "zap", tier: 2,
        check: (s) => s.longestStreak >= 14,
        progress: (s) => ({ current: Math.min(s.currentStreak, 14), target: 14, label: "14 day streak" }),
    },
    {
        id: "war_machine", label: "War Machine", desc: "30-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "castle", tier: 3,
        check: (s) => s.longestStreak >= 30,
        progress: (s) => ({ current: Math.min(s.currentStreak, 30), target: 30, label: "30 day streak" }),
    },
    {
        id: "centurion", label: "Centurion", desc: "60-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "bird", tier: 4,
        check: (s) => s.longestStreak >= 60,
        progress: (s) => ({ current: Math.min(s.currentStreak, 60), target: 60, label: "60 day streak" }),
    },
    {
        id: "unbreakable", label: "Unbreakable", desc: "100-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "gem", tier: 4,
        check: (s) => s.longestStreak >= 100,
        progress: (s) => ({ current: Math.min(s.currentStreak, 100), target: 100, label: "100 day streak" }),
    },
    {
        id: "legion_elite", label: "Legion Elite", desc: "180-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "crown", tier: 5,
        check: (s) => s.longestStreak >= 180,
        progress: (s) => ({ current: Math.min(s.currentStreak, 180), target: 180, label: "180 day streak" }),
    },
    {
        id: "immortal_routine", label: "Immortal Routine", desc: "365-day attendance streak",
        category: "streak", categoryLabel: "Streak", icon: "sparkles", tier: 5,
        check: (s) => s.longestStreak >= 365,
        progress: (s) => ({ current: Math.min(s.currentStreak, 365), target: 365, label: "365 day streak" }),
    },

    // ── SESSION DURATION MEDALS ──
    {
        id: "time_initiate", label: "Time Initiate", desc: "First 60+ min session",
        category: "duration", categoryLabel: "Duration", icon: "timer", tier: 1,
        check: (s) => s.sessions60Plus >= 1,
        progress: (s) => ({ current: Math.min(s.sessions60Plus, 1), target: 1, label: "1 session 60+ min" }),
    },
    {
        id: "hour_locked", label: "Hour Locked", desc: "10 sessions of 60+ minutes",
        category: "duration", categoryLabel: "Duration", icon: "lock", tier: 2,
        check: (s) => s.sessions60Plus >= 10,
        progress: (s) => ({ current: Math.min(s.sessions60Plus, 10), target: 10, label: "10 sessions 60+ min" }),
    },
    {
        id: "deep_grinder", label: "Deep Grinder", desc: "First 90+ min session",
        category: "duration", categoryLabel: "Duration", icon: "pickaxe", tier: 2,
        check: (s) => s.sessions90Plus >= 1,
        progress: (s) => ({ current: Math.min(s.sessions90Plus, 1), target: 1, label: "1 session 90+ min" }),
    },
    {
        id: "time_dominator", label: "Time Dominator", desc: "First 120+ min session",
        category: "duration", categoryLabel: "Duration", icon: "hourglass", tier: 3,
        check: (s) => s.sessions120Plus >= 1,
        progress: (s) => ({ current: Math.min(s.sessions120Plus, 1), target: 1, label: "1 session 120+ min" }),
    },
    {
        id: "chrono_beast", label: "Chrono Beast", desc: "10 sessions of 90+ minutes",
        category: "duration", categoryLabel: "Duration", icon: "skull", tier: 4,
        check: (s) => s.sessions90Plus >= 10,
        progress: (s) => ({ current: Math.min(s.sessions90Plus, 10), target: 10, label: "10 sessions 90+ min" }),
    },
    {
        id: "endurance_god", label: "Endurance God", desc: "5 sessions of 120+ minutes",
        category: "duration", categoryLabel: "Duration", icon: "trident", tier: 5,
        check: (s) => s.sessions120Plus >= 5,
        progress: (s) => ({ current: Math.min(s.sessions120Plus, 5), target: 5, label: "5 sessions 120+ min" }),
    },

    // ── COMBO MEDALS (Streak + Duration) ──
    {
        id: "solid_operator", label: "Solid Operator", desc: "7-day streak + 45 min avg sessions",
        category: "combo", categoryLabel: "Hybrid", icon: "target", tier: 2,
        check: (s) => s.currentStreak >= 7 && s.avgSessionMinutes >= 45,
        progress: (s) => ({
            current: Math.min(s.currentStreak, 7),
            target: 7,
            label: `${Math.min(s.currentStreak, 7)}/7 days, ${s.avgSessionMinutes}/45 min avg`,
        }),
    },
    {
        id: "elite_routine", label: "Elite Routine", desc: "14-day streak + 60 min avg sessions",
        category: "combo", categoryLabel: "Hybrid", icon: "star", tier: 3,
        check: (s) => s.currentStreak >= 14 && s.avgSessionMinutes >= 60,
        progress: (s) => ({
            current: Math.min(s.currentStreak, 14),
            target: 14,
            label: `${Math.min(s.currentStreak, 14)}/14 days, ${s.avgSessionMinutes}/60 min avg`,
        }),
    },
    {
        id: "war_protocol", label: "War Protocol", desc: "30-day streak + 60 min avg sessions",
        category: "combo", categoryLabel: "Hybrid", icon: "sword", tier: 3,
        check: (s) => s.currentStreak >= 30 && s.avgSessionMinutes >= 60,
        progress: (s) => ({
            current: Math.min(s.currentStreak, 30),
            target: 30,
            label: `${Math.min(s.currentStreak, 30)}/30 days, ${s.avgSessionMinutes}/60 min avg`,
        }),
    },
    {
        id: "apex_discipline", label: "Apex Discipline", desc: "60-day streak + 75 min avg sessions",
        category: "combo", categoryLabel: "Hybrid", icon: "award", tier: 4,
        check: (s) => s.currentStreak >= 60 && s.avgSessionMinutes >= 75,
        progress: (s) => ({
            current: Math.min(s.currentStreak, 60),
            target: 60,
            label: `${Math.min(s.currentStreak, 60)}/60 days, ${s.avgSessionMinutes}/75 min avg`,
        }),
    },
    {
        id: "legion_commander", label: "Legion Commander", desc: "100-day streak + 90 min avg sessions",
        category: "combo", categoryLabel: "Hybrid", icon: "trophy", tier: 5,
        check: (s) => s.currentStreak >= 100 && s.avgSessionMinutes >= 90,
        progress: (s) => ({
            current: Math.min(s.currentStreak, 100),
            target: 100,
            label: `${Math.min(s.currentStreak, 100)}/100 days, ${s.avgSessionMinutes}/90 min avg`,
        }),
    },

    // ── DISCIPLINE (NO-SKIP) MEDALS ──
    {
        id: "no_mercy", label: "No Mercy", desc: "14 consecutive days — no skips",
        category: "discipline", categoryLabel: "Discipline", icon: "circle-dot", tier: 2,
        check: (s) => s.longestStreak >= 14,
        progress: (s) => ({ current: Math.min(s.currentStreak, 14), target: 14, label: "14 days no skip" }),
    },
    {
        id: "locked_in", label: "Locked In", desc: "30 consecutive days — no skips",
        category: "discipline", categoryLabel: "Discipline", icon: "lock-keyhole", tier: 3,
        check: (s) => s.longestStreak >= 30,
        progress: (s) => ({ current: Math.min(s.currentStreak, 30), target: 30, label: "30 days no skip" }),
    },
    {
        id: "relentless_system", label: "Relentless System", desc: "60 consecutive days — no skips",
        category: "discipline", categoryLabel: "Discipline", icon: "link", tier: 4,
        check: (s) => s.longestStreak >= 60,
        progress: (s) => ({ current: Math.min(s.currentStreak, 60), target: 60, label: "60 days no skip" }),
    },
    {
        id: "zero_failure", label: "Zero Failure Protocol", desc: "100 consecutive days — no skips",
        category: "discipline", categoryLabel: "Discipline", icon: "flag", tier: 5,
        check: (s) => s.longestStreak >= 100,
        progress: (s) => ({ current: Math.min(s.currentStreak, 100), target: 100, label: "100 days no skip" }),
    },

    // ── COMEBACK MEDALS ──
    {
        id: "phoenix_rise", label: "Phoenix Rise", desc: "Return after a break with 3+ day streak",
        category: "comeback", categoryLabel: "Comeback", icon: "flame-kindling", tier: 1,
        check: (s) => s.comebackActive && s.currentStreak >= 3,
        progress: (s) => ({ current: s.comebackActive ? Math.min(s.currentStreak, 3) : 0, target: 3, label: "3 day comeback" }),
    },
    {
        id: "system_reboot", label: "System Reboot", desc: "7-day recovery streak after a break",
        category: "comeback", categoryLabel: "Comeback", icon: "refresh-cw", tier: 2,
        check: (s) => s.comebackActive && s.currentStreak >= 7,
        progress: (s) => ({ current: s.comebackActive ? Math.min(s.currentStreak, 7) : 0, target: 7, label: "7 day recovery" }),
    },
    {
        id: "redemption_arc", label: "Redemption Arc", desc: "Beat your previous best streak",
        category: "comeback", categoryLabel: "Comeback", icon: "bolt", tier: 3,
        check: (s) => s.previousStreak > 0 && s.currentStreak > s.previousStreak,
        progress: (s) => ({
            current: Math.min(s.currentStreak, s.previousStreak > 0 ? s.previousStreak + 1 : 999),
            target: s.previousStreak > 0 ? s.previousStreak + 1 : 999,
            label: `Beat ${s.previousStreak} day streak`,
        }),
    },
    {
        id: "stronger_than_before", label: "Stronger Than Before", desc: "Double your previous best streak",
        category: "comeback", categoryLabel: "Comeback", icon: "dumbbell", tier: 4,
        check: (s) => s.previousStreak > 0 && s.currentStreak >= s.previousStreak * 2,
        progress: (s) => ({
            current: Math.min(s.currentStreak, s.previousStreak > 0 ? s.previousStreak * 2 : 999),
            target: s.previousStreak > 0 ? s.previousStreak * 2 : 999,
            label: `2x previous (${s.previousStreak * 2} days)`,
        }),
    },
];

export const TIER_COLORS: Record<number, { border: string; bg: string; text: string; glow: string }> = {
    1: { border: "border-[#CD7F32]", bg: "bg-[#CD7F32]/10", text: "text-[#CD7F32]", glow: "shadow-[0_0_12px_rgba(205,127,50,0.3)]" },
    2: { border: "border-[#C0C0C0]", bg: "bg-[#C0C0C0]/10", text: "text-[#C0C0C0]", glow: "shadow-[0_0_12px_rgba(192,192,192,0.3)]" },
    3: { border: "border-[#FFD700]", bg: "bg-[#FFD700]/10", text: "text-[#FFD700]", glow: "shadow-[0_0_12px_rgba(255,215,0,0.3)]" },
    4: { border: "border-[#00daf3]", bg: "bg-[#00daf3]/10", text: "text-[#00daf3]", glow: "shadow-[0_0_16px_rgba(0,218,243,0.4)]" },
    5: { border: "border-[#b6c4ff]", bg: "bg-[#b6c4ff]/15", text: "text-[#b6c4ff]", glow: "shadow-[0_0_20px_rgba(182,196,255,0.5)]" },
};

export const TIER_LABELS: Record<number, string> = {
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Platinum",
    5: "Legendary",
};

export const CATEGORY_COLORS: Record<MedalCategory, string> = {
    streak: "#00daf3",
    duration: "#FFD700",
    combo: "#b6c4ff",
    discipline: "#ff6b6b",
    comeback: "#50fa7b",
};

export function computeMedals(stats: MedalStats) {
    const unlocked = ALL_MEDALS.filter((m) => m.check(stats));
    const locked = ALL_MEDALS.filter((m) => !m.check(stats));

    // Next medal to unlock: first locked medal sorted by tier
    const nextMedal = locked.sort((a, b) => a.tier - b.tier)[0] || null;

    return { unlocked, locked, nextMedal, total: ALL_MEDALS.length };
}
