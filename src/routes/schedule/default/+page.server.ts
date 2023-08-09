import {redirect} from "@sveltejs/kit";
import {db} from "$lib/server/db";
import {schedule,subject} from "$lib/schema";
import type {PageServerLoad} from "./$types";
import {asc, lte} from "drizzle-orm";

export const load = (async ({locals}: { locals: any }) => {
    const session = await locals.getSession();
    if (!session?.user) throw redirect(303, "/signin");

    const scheduleData = await db.select({
        date: schedule.date,
        time: schedule.time,
        subject: schedule.subject,
        belongings: schedule.belongings,
    }).from(schedule).where(lte(schedule.date, 7)).orderBy(asc(schedule.date), asc(schedule.time));

    const uniqueSchedule:any[][]=[[],[],[],[],[],[],[]];
    for (const schedule of scheduleData) {
        const date = schedule.date as number;
        uniqueSchedule[date].push({
            time: schedule.time,
            subject: schedule.subject,
            belongings: schedule.belongings,
        });
    }
    const subjects:{[key: string]: { id: string, short: string, name: string, teacher: string, room: string, memo: string }} = {};
    const subjectsData = await db.select().from(subject);
    for(const sub of subjectsData){
        // @ts-ignore
        subjects[sub.id]=sub;
    }

    return {schedule:uniqueSchedule,subjects};
}) satisfies PageServerLoad;