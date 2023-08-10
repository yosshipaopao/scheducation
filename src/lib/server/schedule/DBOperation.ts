import scheduleScript from "$lib/schedule";
import type {db} from "$lib/server/db";
import {schedule, subject} from "$lib/schema";
import {eq, inArray} from "drizzle-orm";

export interface SubjectData {
    id: string,
    short: string,
    name: string,
    teacher: string | null,
    room: string | null
    memo: string | null
}

export interface ScheduleData {
    time: number,
    subject: SubjectData,
    belongings: string | null,
    memo: string | null
}

export const GetSheduleByDate = async (DB: typeof db, date: Date, subjects: Map<string, any> | null = null)=> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const base = scheduleScript.convertDate(year, month, day);
    const scheduleData = await DB.select().from(schedule).where(eq(schedule.date, base)).orderBy(schedule.time);
    if (subjects === null) {
        subjects = new Map<string, any>();
        const subjectsId = new Set<string>();
        for (const schedule of scheduleData) {
            subjectsId.add(schedule.subject as string);
        }
        const subjectsData = await DB.select().from(subject).where(inArray(subject.id, Array.from(subjectsId)));
        for (const sub of subjectsData) {
            subjects.set(sub.id as string, sub);
        }
    }
    const data: ScheduleData[] = [];
    for (const schedule of scheduleData) {
        const time = schedule.time as number;
        data.push({
            time: time,
            subject: subjects.get(schedule.subject as string),
            belongings: schedule.belongings as string,
            memo: schedule.memo as string
        });
    }
    return data;
}