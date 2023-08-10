import type {PageServerLoad} from './$types';
import {redirect} from "@sveltejs/kit";
import scheduleScript from "$lib/schedule";
import {db} from "$lib/server/db";
import {schedule, subject} from "$lib/schema";
import {eq, inArray} from "drizzle-orm";

export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
    const defaults = scheduleScript.defaults();
    const param = {
        year: params.year ?? defaults.year,
        month: params.month ?? defaults.month,
        date: params.date ?? defaults.date,
    }
    const {year, month, date} = scheduleScript.check("week", param.year, param.month, param.date);
    const data: any[] = [];
    const baseDate = new Date(year, month - 1, date);
    const base = scheduleScript.convertDate(baseDate.getFullYear(), baseDate.getMonth() + 1, baseDate.getDate());
    //スケジュール取得
    const scheduleData = await db.select({
        time: schedule.time,
        subject: schedule.subject,
        belongings: schedule.belongings,
        memo: schedule.memo,
    }).from(schedule).where(eq(schedule.date, base));
    const day = baseDate.getDay();
    //デフォルトの時間割取得
    const rawData = await db.select().from(schedule).where(eq(schedule.date, day)).orderBy(schedule.time);
    const subjects: {
        [key: string]: { id: string, short: string, name: string, teacher: string, room: string, memo: string }
    } = {};
    const subjectsData = await db.select().from(subject);
    for (const sub of subjectsData) {
        // @ts-ignore
        subjects[sub.id] = sub;
    }
    for (const d of rawData) {
        data.push({
            hour: d.time as number,
            subject: subjects[d.subject as string],
            detail: {
                belongings: d.belongings as string,
                memo: d.memo as string
            }
        });
    }
    for (const schedule of scheduleData) {
        const time = schedule.time as number;
        data[time] = {
            hour: time,
            subject: subjects[schedule.subject as string],
            detail: {
                belongings: schedule.belongings as string,
                memo: schedule.memo as string
            }
        };
    }

    return {
        slug: {
            year: year,
            month: month,
            date: date
        },
        data,
        subjects
    }
}) satisfies PageServerLoad;