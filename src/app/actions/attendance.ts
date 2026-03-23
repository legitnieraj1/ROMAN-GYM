"use server";

import { supabaseAdmin } from "@/lib/supabase";

import { getSession } from "@/lib/auth"; // Import custom session getter

export async function markAttendance() {
    if (!supabaseAdmin) {
        return { success: false, error: "Server configuration error" };
    }

    // 1. Check Authentication using custom session
    const session = await getSession();
    if (!session || !session.userId) {
        return { success: false, error: "Not authenticated" };
    }
    const userId = session.userId;

    try {
        // 2. Check for existing record for today
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const { data: existingRecord, error: fetchError } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .eq('member_id', userId)
            .eq('date', today)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error("Fetch error:", fetchError);
            return { success: false, error: "Failed to fetch attendance" };
        }

        if (existingRecord) {
            // 3. If checked in but not checked out -> Check Out
            if (!existingRecord.check_out_time) {
                const { error: updateError } = await supabaseAdmin
                    .from('attendance')
                    .update({ check_out_time: new Date().toISOString() })
                    .eq('id', existingRecord.id);

                if (updateError) throw updateError;

                // Get user name for better UX from MEMBERS table
                const { data: profile } = await supabaseAdmin.from('members').select('name').eq('id', userId).single();

                return {
                    success: true,
                    status: 'CHECK_OUT',
                    name: profile?.name,
                    time: new Date().toLocaleTimeString('en-US', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    })
                };
            } else {
                // Already checked out
                const { data: profile } = await supabaseAdmin.from('members').select('name').eq('id', userId).single();
                return { success: true, status: 'ALREADY_COMPLETED', name: profile?.name };
            }
        } else {
            // 4. No record -> Check In
            const { error: insertError } = await supabaseAdmin
                .from('attendance')
                .insert({
                    member_id: userId,
                    check_in_time: new Date().toISOString(),
                    date: today
                });

            if (insertError) throw insertError;

            const { data: profile } = await supabaseAdmin.from('members').select('name').eq('id', userId).single();
            return {
                success: true,
                status: 'CHECK_IN',
                name: profile?.name,
                time: new Date().toLocaleTimeString('en-US', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                })
            };
        }

    } catch (error: any) {
        console.error("Attendance error:", error);
        return { success: false, error: error.message || "Failed to mark attendance" };
    }
}

// Helper to auto-checkout sessions older than 3 hours
export async function autoCheckoutOldSessions() {
    if (!supabaseAdmin) return;

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const today = new Date().toISOString().split('T')[0];

    try {
        // Find active sessions for today that started more than 3 hours ago
        const { data: staleSessions, error: fetchError } = await supabaseAdmin
            .from('attendance')
            .select('id, check_in_time')
            .eq('date', today)
            .is('check_out_time', null)
            .lt('check_in_time', threeHoursAgo.toISOString());

        if (fetchError) {
            console.error("Error fetching stale sessions:", fetchError);
            return;
        }

        if (staleSessions && staleSessions.length > 0) {
            console.log(`Auto-checking out ${staleSessions.length} stale sessions...`);

            // Update each session
            for (const session of staleSessions) {
                const checkInTime = new Date(session.check_in_time);
                const autoCheckOutTime = new Date(checkInTime.getTime() + 3 * 60 * 60 * 1000);

                await supabaseAdmin
                    .from('attendance')
                    .update({ check_out_time: autoCheckOutTime.toISOString() })
                    .eq('id', session.id);
            }
        }
    } catch (error) {
        console.error("Auto-checkout error:", error);
    }
}

// Compute full medal/achievement data for a member
export async function getMedalData(memberId: string) {
    if (!supabaseAdmin) return null;

    const { data: attendance } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('member_id', memberId)
        .order('check_in_time', { ascending: false });

    if (!attendance || attendance.length === 0) {
        return {
            totalCheckIns: 0,
            currentStreak: 0,
            longestStreak: 0,
            previousStreak: 0,
            avgSessionMinutes: 0,
            longestSessionMinutes: 0,
            sessions60Plus: 0,
            sessions90Plus: 0,
            sessions120Plus: 0,
            validSessions: 0,
            comebackActive: false,
        };
    }

    // Build a set of dates with valid sessions (>= 20 min)
    const validDates = new Set<string>();
    const allDates = new Set<string>();
    let totalDurationMin = 0;
    let validSessionCount = 0;
    let longestSessionMin = 0;
    let sessions60 = 0;
    let sessions90 = 0;
    let sessions120 = 0;

    for (const record of attendance) {
        const dateStr = record.date || record.check_in_time?.split('T')[0];
        if (dateStr) allDates.add(dateStr);

        if (record.check_in_time && record.check_out_time) {
            const checkIn = new Date(record.check_in_time);
            const checkOut = new Date(record.check_out_time);
            const durationMin = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);

            if (durationMin >= 20) {
                validDates.add(dateStr);
                totalDurationMin += durationMin;
                validSessionCount++;
                if (durationMin > longestSessionMin) longestSessionMin = durationMin;
                if (durationMin >= 60) sessions60++;
                if (durationMin >= 90) sessions90++;
                if (durationMin >= 120) sessions120++;
            }
        } else if (dateStr) {
            // Checked in but not out yet (or auto-checkout) — still counts as showing up
            validDates.add(dateStr);
        }
    }

    // Calculate streaks from sorted dates
    const sortedDates = Array.from(allDates).sort().reverse(); // newest first
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let previousStreak = 0;
    let tempStreak = 0;
    let streaks: number[] = [];

    // Walk backwards from today
    for (let i = 0; i < 730; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (allDates.has(dateStr)) {
            tempStreak++;
        } else {
            if (checkDate.getDay() === 0) {
                continue; // Missing Sunday does not break the streak
            }
            if (i === 0) continue; // today not checked in yet is ok
            if (tempStreak > 0) {
                streaks.push(tempStreak);
                tempStreak = 0;
            }
            if (streaks.length === 0) {
                // Still building current streak — gap means end
                break;
            }
            if (streaks.length >= 2) break; // Got current + previous
        }
    }
    if (tempStreak > 0) streaks.push(tempStreak);

    currentStreak = streaks[0] || 0;
    previousStreak = streaks[1] || 0;

    // Longest streak: walk all dates
    const allSorted = Array.from(allDates).sort();
    let runningStreak = 1;
    for (let i = 1; i < allSorted.length; i++) {
        const prev = new Date(allSorted[i - 1]);
        const curr = new Date(allSorted[i]);
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            runningStreak++;
        } else if (diff === 2) {
            const missingDate = new Date(prev);
            missingDate.setDate(missingDate.getDate() + 1);
            if (missingDate.getDay() === 0) {
                // Missing day was Sunday, so streak continues
                runningStreak++;
            } else {
                if (runningStreak > longestStreak) longestStreak = runningStreak;
                runningStreak = 1;
            }
        } else {
            if (runningStreak > longestStreak) longestStreak = runningStreak;
            runningStreak = 1;
        }
    }
    if (runningStreak > longestStreak) longestStreak = runningStreak;

    const avgSessionMin = validSessionCount > 0 ? totalDurationMin / validSessionCount : 0;

    // Comeback detection: had a streak, broke it (gap >= 3 days), now rebuilding
    const comebackActive = previousStreak > 0 && currentStreak >= 3 && currentStreak > 0;

    return {
        totalCheckIns: attendance.length,
        currentStreak,
        longestStreak,
        previousStreak,
        avgSessionMinutes: Math.round(avgSessionMin),
        longestSessionMinutes: Math.round(longestSessionMin),
        sessions60Plus: sessions60,
        sessions90Plus: sessions90,
        sessions120Plus: sessions120,
        validSessions: validSessionCount,
        comebackActive,
    };
}

export async function getTodaysLog() {
    if (!supabaseAdmin) return [];

    // Trigger auto-checkout maintenance
    await autoCheckoutOldSessions();

    const today = new Date().toISOString().split('T')[0];

    const { data: logs, error } = await supabaseAdmin
        .from('attendance')
        .select(`
            *,
            member:members (
                name
            )
        `)
        .eq('date', today)
        .order('check_in_time', { ascending: false });

    if (error) {
        console.error("Fetch logs error:", error);
        return [];
    }

    return logs;
}
