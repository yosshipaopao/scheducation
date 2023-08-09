import {error, redirect} from "@sveltejs/kit";
import {db} from "$lib/server/db";
import {schedule, subject} from "$lib/schema";
import type {PageServerLoad, Actions} from "./$types";
import {and, asc, eq, inArray, lte} from "drizzle-orm";

export const load = (async ({locals}: { locals: any }) => {
    const session = await locals.getSession();
    if (!session?.user) throw redirect(303, "/signin");

    const scheduleData = await db.select({
        date: schedule.date,
        time: schedule.time,
        subject: schedule.subject,
        belongings: schedule.belongings,
    }).from(schedule).where(lte(schedule.date, 7)).orderBy(asc(schedule.date), asc(schedule.time));

    const uniqueSchedule: any[][] = [[], [], [], [], [], [], []];
    for (const schedule of scheduleData) {
        const date = schedule.date as number;
        uniqueSchedule[date].push({
            time: schedule.time,
            subject: schedule.subject,
            belongings: schedule.belongings,
        });
    }
    const subjects: {
        [key: string]: { id: string, short: string, name: string, teacher: string, room: string, memo: string }
    } = {};
    const subjectsData = await db.select().from(subject);
    for (const sub of subjectsData) {
        // @ts-ignore
        subjects[sub.id] = sub;
    }

    return {schedule: uniqueSchedule, subjects};
}) satisfies PageServerLoad;

export const actions = {
    default: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(401, "Unauthorized");
        const body = await request.formData();
        const newScheduleData = JSON.parse(body.get("schedule") as string);
        const newSubjectsData = JSON.parse(body.get("subjects") as string);
        const oldSubjects = await db.select().from(subject).where(inArray(subject.id, Object.keys(newSubjectsData)));
        const oldSubjectIds = oldSubjects.map(sub => sub.id);
        const newSubjects = Object.keys(newSubjectsData).filter(id => !oldSubjectIds.includes(id)).map(id => newSubjectsData[id]);
        const oldSchedule = await db.select({
            date: schedule.date,
            time: schedule.time,
            subject: schedule.subject,
            belongings: schedule.belongings,
        }).from(schedule).where(lte(schedule.date, 7)).orderBy(asc(schedule.date), asc(schedule.time));
        const oldFixedSchedule: any[][] = [[], [], [], [], [], [], []];
        for (const schedule of oldSchedule) {
            const date = schedule.date as number;
            oldFixedSchedule[date].push({
                time: schedule.time,
                subject: schedule.subject,
                belongings: schedule.belongings,
            });
        }
        const newSchedules: any[] = [];
        const updateSchedules: any[] = [];
        const deleteSchedules: any[] = [];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < Math.max(oldFixedSchedule[i].length, newScheduleData[i].length); j++) {
                if (oldFixedSchedule[i][j] === undefined || newScheduleData[i][j] === undefined || oldFixedSchedule[i][j].subject !== newScheduleData[i][j].subject || oldFixedSchedule[i][j].belongings !== newScheduleData[i][j].belongings) {
                    const newType = oldFixedSchedule[i][j] === undefined ? "new" : newScheduleData[i][j] === undefined ? "delete" : "update";
                    if (newType === "new") newSchedules.push({
                        date: i,
                        time: j,
                        subject: newScheduleData[i][j].subject,
                        belongings: newScheduleData[i][j].belongings
                    });
                    else if (newType === "update") updateSchedules.push({
                        date: i,
                        time: j,
                        subject: newScheduleData[i][j].subject,
                        belongings: newScheduleData[i][j].belongings
                    });
                    else if (newType === "delete") deleteSchedules.push({day: i, time: j});
                }
            }
        }
        console.log(newSchedules, updateSchedules, deleteSchedules);
        try {
            if (newSchedules.length !== 0)await db.insert(schedule).values(newSchedules);
            if (deleteSchedules.length !== 0) for (const s of deleteSchedules)await db.delete(schedule).where(and(eq(schedule.date, s.day), eq(schedule.time, s.time)));
            if (updateSchedules.length !== 0) for (const s of updateSchedules) await db.update(schedule).set(s).where(and(eq(schedule.date, s.date), eq(schedule.time, s.time)));
        } catch (e) {
            console.error(e);
        }
        console.log(newSubjects);
        try {
            if(newSchedules.length!==0) await db.insert(subject).values(newSubjects);
        } catch (e) {
            console.error(e);
        }

    }
} satisfies Actions;