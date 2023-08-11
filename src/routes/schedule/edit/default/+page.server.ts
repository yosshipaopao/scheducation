import {error, redirect} from "@sveltejs/kit";
import {db} from "$lib/server/db";
import type {PageServerLoad, Actions} from "./$types";
import {GetDefaultWeekSchedule, GetDetailSubjects, GetNonDetailWeekSchedule} from "$lib/server/schedule/Data";
import {schedule, subject} from "$lib/schema";
import {and, eq} from "drizzle-orm";

export const load = (async ({locals}: { locals: any }) => {
    const session = await locals.getSession();
    if (!session?.user) throw redirect(303, "/signin");

    const defaultSchedule = await GetNonDetailWeekSchedule(db);
    const subjects = await GetDetailSubjects(db);

    return {schedule: defaultSchedule, subjects};
}) satisfies PageServerLoad;

export const actions = {
    default: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(401, "Unauthorized");
        const body = await request.formData();
        const rawSchedule = JSON.parse(body.get("schedule") as string);
        const rawSubjects = JSON.parse(body.get("subjects") as string);
        const oldSchedule = await GetNonDetailWeekSchedule(db);
        const oldSubjects = await GetDetailSubjects(db);
        const newSchedules: any[] = [];
        const updateSchedules: any[] = [];
        const deleteSchedules: any[] = [];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < Math.max(oldSchedule[i].length, rawSchedule[i].length); j++) {
                if (oldSchedule[i][j] === undefined) {
                    newSchedules.push({
                        date: i,
                        time: j,
                        subject: rawSchedule[i][j].subject,
                    });
                } else if (rawSchedule[i][j] === undefined) {
                    deleteSchedules.push({
                        date: i,
                        time: j,
                    });
                } else {
                    const oldScheduleData = oldSchedule[i][j];
                    const newScheduleData = rawSchedule[i][j];
                    if (oldScheduleData.subject !== newScheduleData.subject) {
                        updateSchedules.push({
                            date: i,
                            time: j,
                            subject: newScheduleData.subject,
                        });
                    }
                }
            }
        }
        const newSubjects: any[] = [];
        const oldSubjectIds = new Set<string>(oldSubjects.map(sub => sub.id));
        for (const sub of rawSubjects) if (!oldSubjectIds.has(sub.id)) newSubjects.push(sub);

        try {

            if (newSchedules.length !== 0) await db.insert(schedule).values(newSchedules);
            if (deleteSchedules.length !== 0) for (const s of deleteSchedules) await db.delete(schedule).where(and(eq(schedule.date, s.date), eq(schedule.time, s.time)));
            if (updateSchedules.length !== 0) for (const s of updateSchedules) await db.update(schedule).set(s).where(and(eq(schedule.date, s.date), eq(schedule.time, s.time)));
        } catch (e) {
            console.error(e);
        }
        try {
            if (newSubjects.length !== 0) await db.insert(subject).values(newSubjects);
        } catch (e) {
            console.error(e);
        }
        return {success: true};
    }
} satisfies Actions;