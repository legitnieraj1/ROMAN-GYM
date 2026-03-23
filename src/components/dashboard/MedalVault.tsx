"use client";

import { useState } from "react";
import type { MedalCategory, MedalStats } from "@/lib/medals";
import { TIER_COLORS, TIER_LABELS, CATEGORY_COLORS } from "@/lib/medals";
import {
    Swords, Flame, Shield, Zap, Castle, Bird, Gem, Crown, Sparkles,
    Timer, Lock, Pickaxe, Hourglass, Skull,
    Target, Star, Sword, Award, Trophy,
    CircleDot, KeyRound, Link2, Flag,
    RefreshCw, Dumbbell,
    type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
    swords: Swords, flame: Flame, shield: Shield, zap: Zap, castle: Castle,
    bird: Bird, gem: Gem, crown: Crown, sparkles: Sparkles,
    timer: Timer, lock: Lock, pickaxe: Pickaxe, hourglass: Hourglass, skull: Skull, trident: Crown,
    target: Target, star: Star, sword: Sword, award: Award, trophy: Trophy,
    "circle-dot": CircleDot, "lock-keyhole": KeyRound, link: Link2, flag: Flag,
    "flame-kindling": Flame, "refresh-cw": RefreshCw, bolt: Zap, dumbbell: Dumbbell,
};

interface MedalItem {
    id: string;
    label: string;
    desc: string;
    icon: string;
    tier: number;
    category: MedalCategory;
    categoryLabel: string;
    progress?: { current: number; target: number; label: string };
    isUnlocked?: boolean;
}

interface MedalVaultProps {
    stats: MedalStats;
    unlocked: MedalItem[];
    locked: MedalItem[];
    nextMedal: MedalItem | null;
    total: number;
}

const CATEGORIES: { key: MedalCategory | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "streak", label: "Streak" },
    { key: "duration", label: "Duration" },
    { key: "combo", label: "Hybrid" },
    { key: "discipline", label: "Discipline" },
    { key: "comeback", label: "Comeback" },
];

export function MedalVault({ stats, unlocked, locked, nextMedal, total }: MedalVaultProps) {
    const [activeCategory, setActiveCategory] = useState<MedalCategory | "all">("all");
    const [selectedMedal, setSelectedMedal] = useState<MedalItem | null>(null);

    const unlockedIds = new Set(unlocked.map((m) => m.id));

    const allMedals = [
        ...unlocked.map((m) => ({ ...m, isUnlocked: true })),
        ...locked.map((m) => ({ ...m, isUnlocked: false })),
    ];

    const filtered = activeCategory === "all"
        ? allMedals
        : allMedals.filter((m) => m.category === activeCategory);

    const unlockedCount = unlocked.length;

    return (
        <div className="bg-[#1c1b1c] p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-black text-lg uppercase tracking-widest flex items-center gap-3">
                    <span className="w-1 h-5 bg-[#0059ff]" />
                    Medal Vault
                </h2>
                <span className="text-[10px] font-bold tracking-[2px] text-[#b6c4ff] uppercase">
                    {unlockedCount} / {total}
                </span>
            </div>

            {/* Overall progress bar */}
            <div className="h-1.5 w-full bg-[#353436] mb-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#0059ff] via-[#00daf3] to-[#b6c4ff] transition-all duration-700"
                    style={{ width: `${(unlockedCount / total) * 100}%` }}
                />
            </div>

            {/* Next Medal Progress */}
            {nextMedal && nextMedal.progress && (
                <div className="mb-6 p-4 bg-[#0e0e0f] border border-[#434656]/20">
                    <div className="flex items-center gap-3 mb-2">
                        {(() => { const Icon = ICON_MAP[nextMedal.icon]; return Icon ? <Icon className="w-6 h-6" style={{ color: CATEGORY_COLORS[nextMedal.category] }} /> : <Shield className="w-6 h-6 text-[#bec8d3]" />; })()}
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-black uppercase tracking-wider text-[#b6c4ff]">
                                    Next: {nextMedal.label}
                                </p>
                                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5" style={{
                                    color: TIER_COLORS[nextMedal.tier]?.text.replace("text-[", "").replace("]", "") || "#bec8d3",
                                    backgroundColor: `${CATEGORY_COLORS[nextMedal.category]}15`,
                                    border: `1px solid ${CATEGORY_COLORS[nextMedal.category]}30`,
                                }}>
                                    {TIER_LABELS[nextMedal.tier]}
                                </span>
                            </div>
                            <p className="text-[10px] text-[#bec8d3] opacity-60 mt-0.5">{nextMedal.progress.label}</p>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-[#353436] overflow-hidden">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (nextMedal.progress.current / nextMedal.progress.target) * 100)}%`,
                                backgroundColor: CATEGORY_COLORS[nextMedal.category],
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-[#bec8d3] opacity-40 mt-1.5 text-right font-mono">
                        {nextMedal.progress.current} / {nextMedal.progress.target}
                    </p>
                </div>
            )}

            {/* Category Tabs */}
            <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    const catCount = cat.key === "all"
                        ? unlockedCount
                        : unlocked.filter((m) => m.category === cat.key).length;
                    return (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex-shrink-0 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                                isActive
                                    ? "bg-[#0059ff]/20 text-[#b6c4ff] border border-[#0059ff]/40"
                                    : "bg-[#0e0e0f] text-[#bec8d3] opacity-50 border border-transparent hover:opacity-80"
                            }`}
                        >
                            {cat.label}
                            {catCount > 0 && (
                                <span className="ml-1.5 text-[8px] opacity-60">{catCount}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Medal Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {filtered.map((medal) => {
                    const tierStyle = TIER_COLORS[medal.tier] || TIER_COLORS[1];
                    const isUnlocked = medal.isUnlocked;

                    return (
                        <button
                            key={medal.id}
                            onClick={() => setSelectedMedal(selectedMedal?.id === medal.id ? null : medal)}
                            className={`relative aspect-square bg-[#0e0e0f] flex flex-col items-center justify-center gap-1.5 border transition-all group ${
                                isUnlocked
                                    ? `${tierStyle.border} hover:${tierStyle.glow}`
                                    : "border-[#434656]/10 opacity-25 grayscale"
                            }`}
                        >
                            {/* Tier indicator dot */}
                            {isUnlocked && (
                                <div
                                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: CATEGORY_COLORS[medal.category] }}
                                />
                            )}
                            {(() => { const Icon = ICON_MAP[medal.icon]; return Icon ? <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isUnlocked ? "group-hover:scale-110 transition-transform" : ""}`} style={{ color: isUnlocked ? CATEGORY_COLORS[medal.category] : "#bec8d3" }} /> : <Shield className="w-6 h-6 text-[#bec8d3]" />; })()}
                            <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-[#bec8d3] opacity-60 text-center leading-tight px-1">
                                {medal.label}
                            </span>

                            {/* Progress bar for locked medals */}
                            {!isUnlocked && medal.progress && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#353436]">
                                    <div
                                        className="h-full opacity-60"
                                        style={{
                                            width: `${Math.min(100, (medal.progress.current / medal.progress.target) * 100)}%`,
                                            backgroundColor: CATEGORY_COLORS[medal.category],
                                        }}
                                    />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Medal Detail */}
            {selectedMedal && (
                <div className="mt-4 p-4 bg-[#0e0e0f] border border-[#434656]/20 animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                        {(() => { const Icon = ICON_MAP[selectedMedal.icon]; return Icon ? <Icon className="w-7 h-7" style={{ color: CATEGORY_COLORS[selectedMedal.category] }} /> : <Shield className="w-7 h-7 text-[#bec8d3]" />; })()}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-sm uppercase tracking-wider">{selectedMedal.label}</h3>
                                <span
                                    className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5"
                                    style={{
                                        color: CATEGORY_COLORS[selectedMedal.category],
                                        backgroundColor: `${CATEGORY_COLORS[selectedMedal.category]}15`,
                                        border: `1px solid ${CATEGORY_COLORS[selectedMedal.category]}30`,
                                    }}
                                >
                                    {selectedMedal.categoryLabel}
                                </span>
                                <span
                                    className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5"
                                    style={{
                                        color: TIER_COLORS[selectedMedal.tier]?.text.replace("text-[", "").replace("]", ""),
                                        backgroundColor: `${TIER_COLORS[selectedMedal.tier]?.text.replace("text-[", "").replace("]", "")}15`,
                                    }}
                                >
                                    {TIER_LABELS[selectedMedal.tier]}
                                </span>
                            </div>
                            <p className="text-xs text-[#bec8d3] opacity-60">{selectedMedal.desc}</p>
                            {selectedMedal.isUnlocked ? (
                                <p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mt-2">Unlocked</p>
                            ) : selectedMedal.progress ? (
                                <div className="mt-2">
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-[#bec8d3] opacity-40">{selectedMedal.progress.label}</span>
                                        <span className="text-[#bec8d3] opacity-40 font-mono">{selectedMedal.progress.current}/{selectedMedal.progress.target}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#353436]">
                                        <div
                                            className="h-full"
                                            style={{
                                                width: `${Math.min(100, (selectedMedal.progress.current / selectedMedal.progress.target) * 100)}%`,
                                                backgroundColor: CATEGORY_COLORS[selectedMedal.category],
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer count */}
            <p className="mt-4 text-[10px] text-center font-bold tracking-[2px] text-[#bec8d3] uppercase opacity-40">
                {unlockedCount} / {total} Achievements Unlocked
            </p>
        </div>
    );
}
