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

export type SubjectsMap = Map<string, SubjectData>

export const GetSubjectsFromSubjectsId = async (DB: typeof db, subjectsId: Set<string>): Promise<SubjectsMap> => {
    const subjects: SubjectsMap = new Map();
    const subjectsData = await DB.select().from(subject).where(inArray(subject.id, Array.from(subjectsId))) as SubjectData[];
    for (const sub of subjectsData) {
        subjects.set(sub.id as string, sub);
    }
    return subjects;
}

export const GetScheduleByDate = async (DB: typeof db, date: Date | number, subjectsArg: SubjectsMap | null = null): Promise<ScheduleData[]> => {
    //DBのdateはnumber型
    const base = typeof date == "number" ? date : scheduleScript.convertDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    //DBから取得
    const scheduleData = await DB.select().from(schedule).where(eq(schedule.date, base)).orderBy(schedule.time);
    //subjectsArgがnullの場合はDBから取得する
    const subjects = subjectsArg ?? await GetSubjectsFromSubjectsId(DB, new Set<string>(scheduleData.map((schedule) => schedule.subject as string)));
    //scheduleDataをScheduleDataに変換
    return scheduleData.map((schedule) => ({
        time: schedule.time,
        subject: subjects.get(schedule.subject as string) as SubjectData,
        belongings: schedule.belongings as string,
        memo: schedule.memo as string
    }) as ScheduleData)
}