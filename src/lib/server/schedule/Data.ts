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
    memo: string | null,
    special: number
}

export interface SubjectData {
    id: string,
    short: string,
    name: string,
    special: number
}

export interface DetailScheduleData {
    time: number,
    subject: DetailSubjectData,
    belongings: string | null,
    memo: string | null,
    special:number
}

export interface ScheduleData {
    date: number,
    time: number,
    subject: SubjectData,
}

export interface NonDetailScheduleData {
    date: number,
    time: number,
    subject: string,
}

export interface DayMonthScheduleData {
    date: number,
    special: number,
    info: string
}

export type DetailSubjectsMap = Map<string, DetailSubjectData>;
export type SubjectsMap = Map<string, SubjectData>;

export type DateSchedule = DetailScheduleData[];
export type WeekSchedule = [ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[], ScheduleData[]];
export type NonDetailWeekSchedule = [NonDetailScheduleData[], NonDetailScheduleData[], NonDetailScheduleData[], NonDetailScheduleData[], NonDetailScheduleData[], NonDetailScheduleData[], NonDetailScheduleData[]];
export type MonthSchedule = DayMonthScheduleData[];

export const GetDetailSubjects = async (DB: typeof db,Arg:{special:number[]}={special:[0,1,2]}): Promise<DetailSubjectData[]> => {
    return await DB.select({
        id: subject.id,
        short: subject.short,
        name: subject.name,
        teacher: subject.teacher,
        room: subject.room,
        memo: subject.memo,
        special: subject.special
    }).from(subject).where(inArray(subject.special,Arg.special)) as DetailSubjectData[];
}
export const GetDetailSubjectsFromSubjectsId = async (DB: typeof db, subjectsId: Set<string>): Promise<DetailSubjectsMap> => {
    if (subjectsId.size === 0) return new Map() as DetailSubjectsMap;
    const subjects: DetailSubjectsMap = new Map();
    const subjectsData = await DB.select({
        id: subject.id,
        short: subject.short,
        name: subject.name,
        teacher: subject.teacher,
        room: subject.room,
        memo: subject.memo,
        special: subject.special
    }).from(subject).where(inArray(subject.id, Array.from(subjectsId))) as DetailSubjectData[];
    for (const sub of subjectsData) {
        subjects.set(sub.id as string, sub);
    }
    return subjects;
}
export const GetSubjectsFromSubjectsId = async (DB: typeof db, subjectsId: Set<string>): Promise<SubjectsMap> => {
    if (subjectsId.size === 0) return new Map() as SubjectsMap;
    const subjectsData = await DB.select({
        id: subject.id,
        short: subject.short,
        name: subject.name,
        special: subject.special
    }).from(subject).where(inArray(subject.id, Array.from(subjectsId))) as SubjectData[];
    const subjects: SubjectsMap = new Map();
    for (const sub of subjectsData) subjects.set(sub.id as string, sub);
    return subjects;
}
export const GetDefaultDateSchedule = async (DB: typeof db, day: number, subjectsArg: SubjectsMap | null = null): Promise<DateSchedule> => {
    const data: DateSchedule = [];
    const rawData = await DB.select({
        time: schedule.time,
        subject: schedule.subject,
        belongings: schedule.belongings,
        memo: schedule.memo,
        special:schedule.special
    }).from(schedule).where(eq(schedule.date, day)).orderBy(schedule.time);
    const subjects = subjectsArg ?? await GetDetailSubjectsFromSubjectsId(DB, new Set<string>(rawData.map((schedule) => schedule.subject as string)));
    for (const d of rawData) data.push({
        time: d.time as number,
        subject: subjects.get(d.subject as string) as DetailSubjectData,
        belongings: d.belongings as string,
        memo: d.memo as string,
        special:d.special as number
    });
    return data;
}

export const GetDateSchedule = async (DB: typeof db, date: Date, subjectsArg: DetailSubjectsMap | null = null): Promise<DateSchedule> => {
    //DBのdateはnumber型
    const base = scheduleScript.convertDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    //DetailScheduleDataの配列を作成
    const data: DateSchedule = await GetDefaultDateSchedule(DB, date.getDay(), subjectsArg);
    //DBから取得
    const scheduleData = await DB.select().from(schedule).where(eq(schedule.date, base)).orderBy(schedule.time);
    //subjectsArgがnullの場合はDBから取得する
    const subjects = subjectsArg ?? await GetDetailSubjectsFromSubjectsId(DB, new Set<string>(scheduleData.map((schedule) => schedule.subject as string)));
    //dataに追加
    for (const d of scheduleData) {
        if (data.length <= (d.time as number)) data.push({
            time: d.time as number,
            subject: subjects.get(d.subject as string) as DetailSubjectData,
            belongings: d.belongings as string,
            memo: d.memo as string,
            special:d.special as number
        });
        else data[d.time as number] = {
            time: d.time as number,
            subject: subjects.get(d.subject as string) as DetailSubjectData,
            belongings: d.belongings as string,
            memo: d.memo as string,
            special:d.special as number
        }
    }
    return data;
}

export const GetNonDetailWeekSchedule = async (DB: typeof db): Promise<NonDetailWeekSchedule> => {
    const data: NonDetailWeekSchedule = [[], [], [], [], [], [], []];
    const rawData = await DB.select({
        date: schedule.date,
        time: schedule.time,
        subject: schedule.subject,
    }).from(schedule).where(and(gte(schedule.date, 0), lte(schedule.date, 6))).orderBy(schedule.time);
    for (const d of rawData) data[d.date as number].push({
        date: d.date as number,
        time: d.time as number,
        subject: d.subject as string
    });
    return data;
}
export const GetDefaultWeekSchedule = async (DB: typeof db, subjectsArg?: SubjectsMap): Promise<WeekSchedule> => {
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
    const defaultSchedule = await GetDefaultWeekSchedule(DB, subjectsArg ?? undefined);
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

export const GetMonthSchedule = async (DB: typeof db, baseMonth: Date, subjectsArg: SubjectsMap | null = null) => {
    const startDate = new Date(baseMonth);
    startDate.setDate(-baseMonth.getDay() + 1);
    const finalDate = new Date(baseMonth);
    finalDate.setMonth(finalDate.getMonth() + 1);
    finalDate.setDate(0)
    finalDate.setDate(finalDate.getDate() + (6 - finalDate.getDay()));
    const total = (finalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const start = scheduleScript.convertDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    const final = scheduleScript.convertDate(finalDate.getFullYear(), finalDate.getMonth() + 1, finalDate.getDate());
    const scheduleData = await DB.select({
        date: schedule.date,
        subject: schedule.subject,
    }).from(schedule).where(and(gte(schedule.date, start), lte(schedule.date, final)));
    const subjects = subjectsArg ?? await GetSubjectsFromSubjectsId(DB, new Set<string>(scheduleData.map((schedule) => schedule.subject as string)));
    const scheduleMap = new Map<number, DayMonthScheduleData>();
    for (const d of scheduleData) {
        const date = d.date as number;
        const subject = subjects.get(d.subject as string) as SubjectData;
        if (subject.special !== 0) {
            if (!scheduleMap.has(date)) scheduleMap.set(date, {
                date: date,
                special: subject.special,
                info: subject.short
            });
        }
    }
    const data: MonthSchedule = [];
    for (let i = 0; i < total; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateInt = scheduleScript.convertDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        if (scheduleMap.has(dateInt)) data.push(scheduleMap.get(dateInt) as DayMonthScheduleData);
        else data.push({
            date: dateInt,
            special: 0,
            info: ""
        });
    }
    return data;
}