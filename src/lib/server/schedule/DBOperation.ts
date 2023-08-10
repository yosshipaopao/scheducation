import scheduleScript from "$lib/schedule";
import type {db} from "$lib/server/db";
import {schedule, subject} from "$lib/schema";
import {and, eq, gte, inArray, lte} from "drizzle-orm";

export interface DetailSubjectData {
    id: string,
    short: string,
    name: string,
    teacher: string | null,
    room: string | null
    memo: string | null
}

export interface SubjectData {
    id: string,
    short: string,
    name: string
}

export interface DetailScheduleData {
    time: number,
    subject: DetailSubjectData,
    belongings: string | null,
    memo: string | null
}

export interface ScheduleData {
    date: number,
    time: number,
    subject: SubjectData,
}
export type DetailSubjectsMap = Map<string, DetailSubjectData>;
export type SubjectsMap = Map<string, SubjectData>;

export type WeekSchedule = [ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[]]

export const GetDetailSubjectsFromSubjectsId = async (DB: typeof db, subjectsId: Set<string>): Promise<DetailSubjectsMap> => {
    const subjects: DetailSubjectsMap = new Map();
    const subjectsData = await DB.select({
        id: subject.id,
        short: subject.short,
        name: subject.name,
        teacher: subject.teacher,
        room: subject.room,
        memo: subject.memo
    }).from(subject).where(inArray(subject.id, Array.from(subjectsId))) as DetailSubjectData[];
    for (const sub of subjectsData) {
        subjects.set(sub.id as string, sub);
    }
    return subjects;
}
export const GetSubjectsFromSubjectsId = async (DB: typeof db, subjectsId: Set<string>): Promise<SubjectsMap> => {
    const subjects: SubjectsMap = new Map();
    const subjectsData = await DB.select({
        id: subject.id,
        short: subject.short,
        name: subject.name
    }).from(subject).where(inArray(subject.id, Array.from(subjectsId))) as SubjectData[];
    for (const sub of subjectsData) {
        subjects.set(sub.id as string, sub);
    }
    return subjects;
}

export const GetDateSchedule = async (DB: typeof db, date: Date | number, subjectsArg: DetailSubjectsMap | null = null): Promise<DetailScheduleData[]> => {
    //DBのdateはnumber型
    const base = typeof date == "number" ? date : scheduleScript.convertDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    //DBから取得
    const scheduleData = await DB.select().from(schedule).where(eq(schedule.date, base)).orderBy(schedule.time);
    //subjectsArgがnullの場合はDBから取得する
    const subjects = subjectsArg ?? await GetDetailSubjectsFromSubjectsId(DB, new Set<string>(scheduleData.map((schedule) => schedule.subject as string)));
    //scheduleDataをScheduleDataに変換
    return scheduleData.map((schedule) => ({
        time: schedule.time,
        subject: subjects.get(schedule.subject as string) as DetailSubjectData,
        belongings: schedule.belongings as string,
        memo: schedule.memo as string
    }) as DetailScheduleData)
}

export const GetDefaultWeekSchedule = async (DB: typeof db, subjectsArg: SubjectsMap | null = null): Promise<WeekSchedule> => {
    const data: WeekSchedule = [[], [], [], [], [], [], []];
    const rawData = await DB.select({
        date: schedule.date,
        time: schedule.time,
        subject: schedule.subject,
    }).from(schedule).where(and(gte(schedule.date, 0), lte(schedule.date, 6))).orderBy(schedule.time);
    const subjects = subjectsArg ?? await GetSubjectsFromSubjectsId(DB, new Set<string>(rawData.map((schedule) => schedule.subject as string)));
    for (const d of rawData) data[d.date as number].push({
        date: d.date as number,
        time: d.time as number,
        subject: subjects.get(d.subject as string) as SubjectData
    });
    return data;
}

export const GetWeekSchedule = async (DB: typeof db, baseDate: Date, subjectsArg: SubjectsMap | null = null) => {
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() - 3);
    const date = new Date(startDate);
    const start = scheduleScript.convertDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() + 6);
    const end = scheduleScript.convertDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    //defaultSchedule
    const defaultSchedule = await GetDefaultWeekSchedule(DB, subjectsArg);
    const data: WeekSchedule = [[], [], [], [], [], [], []]
    for (let i = 0; i < 7; i++) data[i] = defaultSchedule[(i + startDay) % 7];
    //DBから取得
    const rawData = await DB.select({
        date: schedule.date,
        time: schedule.time,
        subject: schedule.subject,
    }).from(schedule).where(and(gte(schedule.date, start), lte(schedule.date, end))).orderBy(schedule.date, schedule.time);
    //subjectsArgがnullの場合はDBから取得する
    const subjects = subjectsArg ?? await GetSubjectsFromSubjectsId(DB, new Set<string>(rawData.map((schedule) => schedule.subject as string)));
    //scheduleDataをMapに変換日付とarrayに変換
    const scheduleMap = new Map<number, ScheduleData[]>();
    for (const d of rawData) {
        const date = d.date as number;
        if (!scheduleMap.has(date)) scheduleMap.set(date, []);
        scheduleMap.get(date)?.push({
            date: date,
            time: d.time as number,
            subject: subjects.get(d.subject as string) as SubjectData
        });
    }
    for (let i = 0; i < 7; i++) {
        const dateInt = scheduleScript.convertDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        if (scheduleMap.has(dateInt)) for (const d of scheduleMap.get(dateInt)!) {
            if (data[i].length <= d.time) data[i].push(d);
            else data[i].splice(d.time, 1, d);
        }
        date.setDate(date.getDate() + 1);
    }
    return data;
}

export const GetMonthSchedule = async (DB: typeof db, startDate: Date, subjectsArg: SubjectsMap | null = null) => {

}