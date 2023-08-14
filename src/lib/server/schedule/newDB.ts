import type {db} from "$lib/server/newDB";
import {DateEntry, TimeTable, Subject} from "$lib/newschema";
import {and, eq, gte, lte, ne, or, sql} from "drizzle-orm";

export interface MonthDateSchedule {
    date: number,
    holiday: boolean,
    special: boolean,
    info: string
}
export interface WeekTimeSchedule {
    date: number,
    time: number,
    name: string
}
export interface DateTimeSchedule {
    time: number,
    name: string,
    teacher: string,
    room: string,
    info: string
}

export type MonthSchedule = MonthDateSchedule[];
export type WeekDateSchedule = WeekTimeSchedule[];
export type WeekSchedule = WeekDateSchedule[];
export type DateSchedule = DateTimeSchedule[];
export const GetMonthSchedule = async (DB: typeof db, Arg: { year: number, month: number }) => {
    const {year, month} = Arg;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    const startInt = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
    const endInt = endDate.getFullYear() * 10000 + (endDate.getMonth() + 1) * 100 + endDate.getDate();
    const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    /*動いてなかったらこれを使う
    const raw = await DB.select({
        date: DateEntry.date,
        holiday: sql<boolean>`CASE WHEN ${TimeTable.date} = ${DateEntry.date} OR ${TimeTable.date} = ${DateEntry.day} THEN ${true} ELSE ${false} END`.as("holiday"),
        special: sql<boolean>`CASE WHEN ${TimeTable.date} = ${DateEntry.date} THEN ${true} ELSE ${false} END`.as("special"),
        info: DateEntry.info
    }).from(DateEntry).where(or(gte(DateEntry.date,startInt),lte(DateEntry.date,endInt))).leftJoin(TimeTable, or(eq(DateEntry.date, TimeTable.date), eq(DateEntry.day, TimeTable.date)));
    */
    const raw = await DB.select({
        date: DateEntry.date,
        holiday:DateEntry.holiday,
        special: sql<boolean>`CASE WHEN ${eq(TimeTable.date,DateEntry.date)} THEN ${false} ELSE ${true} END`.as("special"),
        info: DateEntry.info
    }).from(DateEntry).where(and(or(gte(DateEntry.date, startInt), lte(DateEntry.date, endInt)),ne(DateEntry.holiday, true)))
        .leftJoin(TimeTable, or(eq(DateEntry.date, TimeTable.date), eq(DateEntry.day, TimeTable.date)));
    const map = new Map<number, MonthDateSchedule>();
    raw.forEach(v => map.set(v.date, v));
    //整形
    const result: MonthSchedule = [];
    for (let i = 0; i < total; i++) {
        const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
        const d = startDate.getDay();
        result.push(map.get(n) ?? map.get(d) ?? {date: n, holiday: true, special: false, info: ""});
        startDate.setDate(startDate.getDate() + 1);
    }
    return result;
};

export const GetWeekSchedule = async (DB: typeof db, Arg: { year: number, month: number, date: number }) => {
    const {year, month, date} = Arg;
    const startDate = new Date(year, month - 1, date);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(year, month - 1, date);
    endDate.setDate(endDate.getDate() + 3);
    const startInt = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
    const endInt = endDate.getFullYear() * 10000 + (endDate.getMonth() + 1) * 100 + endDate.getDate();
    const raw = await DB.select({
        date: TimeTable.date,
        time: TimeTable.time,
        name: Subject.name,
    }).from(TimeTable).where(and(or(
        lte(TimeTable.date, 6),
        and(gte(TimeTable.date, startInt), lte(TimeTable.date, endInt)),
        ne(DateEntry.holiday, true))
    )).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).leftJoin(DateEntry,eq(TimeTable.date,DateEntry.date)).orderBy(TimeTable.date, TimeTable.time);
    const map = new Map<number, WeekDateSchedule>();
    raw.forEach(v => {
        if (!map.has(v.date)) map.set(v.date, []);
        map.get(v.date)?.push({...v, name: v.name ?? "不明"});
    });
    const result: WeekSchedule = [];
    for (let i = 0; i < 7; i++) {
        const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
        const d = startDate.getDay();
        const thisDay: any[] = [];
        const defaultDay = map.get(d);
        const specialDay = map.get(n);
        for (let j = 0; j < Math.max(defaultDay?.length ?? 0, specialDay?.length ?? 0); j++) {
            thisDay.push(specialDay?.[j] ?? defaultDay?.[j] ?? {date: n, time: j, name: "これが出たらバグっぽい"});
        }
        result.push(thisDay);
    }
    return result;
};

export const GetDateSchedule = async (DB: typeof db, Arg: { year: number, month: number, date: number }) => {
    const {year, month, date} = Arg;
    const baseDate = new Date(year, month - 1, date);
    const day = baseDate.getDay();
    const baseInt = year * 10000 + month * 100 + date;
    const raw = await DB.select({
        date: TimeTable.date,
        time: TimeTable.time,
        spInfo: TimeTable.info,
        spRoom: TimeTable.room,
        name: Subject.name,
        teacher: Subject.teacher,
        room: Subject.room,
        info: Subject.info,
    }).from(TimeTable).where(and(or(
            eq(TimeTable.date, baseInt),
            eq(TimeTable.date, day)
        ),
        ne(DateEntry.holiday, true)
    )).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).leftJoin(DateEntry,eq(TimeTable.date,DateEntry.date)).orderBy(TimeTable.time);
    const defaultMap = new Map<number, DateTimeSchedule>();
    const specialMap = new Map<number, DateTimeSchedule>();
    let maxTime = 0;
    raw.forEach(v => {
        const data = {
            time: v.time,
            name: v.name ?? "不明",
            teacher: v.teacher ?? "",
            room: v.spRoom.length ?? 0 > 0 ? v.spRoom : v.room ?? "",
            info: v.spInfo.length ?? 0 > 0 ? v.spInfo : v.info ?? "",
        }
        if (v.date <= 6) specialMap.set(v.time, data);
        else defaultMap.set(v.time, data);
        maxTime = Math.max(maxTime, v.time);
    });
    const result: DateSchedule = [];
    for (let i = 0; i < maxTime; i++) result.push(specialMap.get(i) ?? defaultMap.get(i) ?? {
        time: i,
        name: "これが出たらバグっぽい",
        teacher: "",
        room: "",
        info: ""
    });
    return result;
}