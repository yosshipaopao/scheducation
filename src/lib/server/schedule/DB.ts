import type {db} from "$lib/server/DB";
import {DateEntry, TimeTable, Subject} from "$lib/schema";
import {and, eq,  or, isNull, between, isNotNull, like, inArray} from "drizzle-orm";

export interface MonthDateSchedule {
    date: number,
    holiday: boolean,
    special: boolean,
    info: string
}

export interface WeekTimeSchedule {
    date: number,
    time: number,
    name: string,
    special: boolean,
    id: number,
}

export interface DateTimeSchedule {
    time: number,
    name: string,
    teacher: string,
    room: string,
    info: string,
    special: boolean,
    unknown?: boolean,
}

export interface SubjectData {
    id: number,
    name: string,
    teacher: string,
    room: string,
    info: string,
}

export type MonthSchedule = MonthDateSchedule[];
export type WeekDateSchedule = WeekTimeSchedule[];
export type WeekSchedule = WeekDateSchedule[];
export type DateSchedule = DateTimeSchedule[];

export type SubjectsData = SubjectData[];
export const GetMonthSchedule = async (DB: typeof db, {year, month,userClass}: {
    year: number,
    month: number,
    userClass: number
}) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    const startInt = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
    const endInt = endDate.getFullYear() * 10000 + (endDate.getMonth() + 1) * 100 + endDate.getDate();
    const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const hasSchedule = await DB.selectDistinct({
        date: TimeTable.date,
    }).from(TimeTable).where(and(
        or(
            between(TimeTable.date, 0, 6),
            between(TimeTable.date, startInt, endInt)
        ),
        eq(TimeTable.class, userClass)
        )
    );
    const TimeTableDates = new Set<number>(
        hasSchedule.map(v => v.date)
    );

    //holidayがtrueの時はSP関係なく休日
    //infoは休日関係なく表示
    const dates = await DB.select({
        date: DateEntry.date,
        holiday: DateEntry.holiday,//OverRide Holiday Check
        info: DateEntry.info,//Add Info Check
    }).from(DateEntry)
        .where(
            and(
                between(DateEntry.date, startInt, endInt),
                eq(DateEntry.class, userClass)
            )
        );
    const holidayMap = new Set<number>();
    const infoMap = new Map<number, string>();
    dates.forEach(v => {
        if (v.holiday) holidayMap.add(v.date);
        if (v.info && v.info !== "") infoMap.set(v.date, v.info);
    });

    const result: {
        date: number,
        holiday: boolean,
        special: boolean,
        info: string
    }[] = [];
    for (let i = 0; i < total; i++) {
        const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
        const d = startDate.getDay();
        result.push(
            {
                date: n,
                holiday: holidayMap.has(n) ? true : !TimeTableDates.has(d) && !TimeTableDates.has(n),
                special: TimeTableDates.has(n),
                info: infoMap.get(n) ?? "",
            }
        )
        startDate.setDate(startDate.getDate() + 1);
    }
    return result;
};

export const GetWeekSchedule = async (DB: typeof db, {year, month, date,userClass}: {
    year: number,
    month: number,
    date: number,
    userClass: number
}) => {
    const startDate = new Date(year, month - 1, date);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(year, month - 1, date);
    endDate.setDate(endDate.getDate() + 3);
    const startInt = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
    const endInt = endDate.getFullYear() * 10000 + (endDate.getMonth() + 1) * 100 + endDate.getDate();
    const holidays = new Set((await DB.select({
        date: DateEntry.date,
    }).from(DateEntry).where(and(
            between(DateEntry.date, startInt, endInt),
            eq(DateEntry.holiday, true),
            eq(DateEntry.class, userClass)
        )
    )).map(v => v.date));
    const raw = await DB.select({
        date: TimeTable.date,
        time: TimeTable.time,
        name: Subject.name,
        id: Subject.id,
    }).from(TimeTable).where(and(
            or(
                between(TimeTable.date, 0, 6),
                between(TimeTable.date, startInt, endInt)
            ),
            eq(TimeTable.class, userClass)
        )
    ).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).orderBy(TimeTable.time);
    const map = new Map<number, Map<number,WeekTimeSchedule>>();
    raw.forEach(v => {
        if (!map.has(v.date)) map.set(v.date, new Map<number,WeekTimeSchedule>());
        map.get(v.date)?.set(v.time,{...v, name: v.name ?? "", special: v.date > 6,id:v.id??-1});
    });
    const result: WeekSchedule = [];
    for (let i = 0; i < 7; i++) {
        const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
        const d = startDate.getDay();
        result.push([]);
        if (!holidays.has(n)) {
            let m = 0;
            const de = map.get(d);
            const sp = map.get(n);
            de?.forEach((v) => {
                m = Math.max(m, v.time + 1);
            })
            for (let j = 0; j < m; j++) {
                result[i].push(sp?.get(j) ??de?.get(j)?? ({
                    date: i,
                    time: j,
                    name: "休み",
                    id: -1,
                    special: false,
                }));
            }
        }
        startDate.setDate(startDate.getDate() + 1);
    }
    return result;
};

export const GetDateSchedule = async (DB: typeof db, {year, month, date,userClass}: {
    year: number,
    month: number,
    date: number,
    userClass: number
}) => {
    const baseDate = new Date(year, month - 1, date);
    const day = baseDate.getDay();
    const baseInt = year * 10000 + month * 100 + date;
    const isHoliday = await DB.select({
        holiday: DateEntry.holiday,
    }).from(DateEntry).where(eq(DateEntry.date, baseInt));
    if (isHoliday.length > 0 && isHoliday[0].holiday) return [] satisfies DateSchedule;
    const raw = await DB.select({
        date: TimeTable.date,
        time: TimeTable.time,
        spInfo: TimeTable.info,
        spRoom: TimeTable.room,
        name: Subject.name,
        teacher: Subject.teacher,
        room: Subject.room,
        info: Subject.info,
    }).from(TimeTable).where(and(
        inArray(TimeTable.date, [baseInt, day]),
        or(isNull(DateEntry.holiday), eq(DateEntry.holiday, false)),
        eq(TimeTable.class, userClass)
    )).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).leftJoin(DateEntry, eq(TimeTable.date, DateEntry.date)).orderBy(TimeTable.time);
    const map = new Map<number, DateTimeSchedule>();
    let maxTime = 0;
    raw.forEach(v => {
        const data = {
            time: v.time,
            name: v.name ?? "不明",
            teacher: v.teacher ?? "",
            room: v.spRoom.length ?? 0 > 0 ? v.spRoom : v.room ?? "",
            info: v.spInfo.length ?? 0 > 0 ? v.spInfo : v.info ?? "",
        }
        if (map.has(v.time)) {
            if (v.date > 6) map.set(v.time, {...data,special:true});
        } else {
            map.set(v.time, {...data,special:v.date > 6 });
        }
        maxTime = Math.max(maxTime, v.time+1);
    });
    const result: DateSchedule = [];
    for (let i = 0; i < maxTime; i++) result.push(map.get(i) ?? {
        time: i,
        name: "なし",
        teacher: "",
        room: "",
        info: "休み",
        special:false,
        unknown: true,
    });
    return result;
}


export const GetDefaultSubjects = async (DB: typeof db,{userClass}:{userClass:number}):Promise<SubjectsData> => {
    const raw = (await DB.select({
        id: Subject.id,
        name: Subject.name,
        teacher: Subject.teacher,
        room: Subject.room,
        info: Subject.info,
    }).from(TimeTable).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).where(
        and(
            between(TimeTable.date, 0, 6),
            isNotNull(Subject.id),
            eq(TimeTable.class, userClass)
        )
    )) ;
    return raw as SubjectsData;
}
export const SearchSubjects = async (DB: typeof db, {limit = 50, offset = 0, q = ""} = {limit: 50, offset: 0, q: ""}):Promise<SubjectsData> => {
    const raw= await DB.select({
        id: Subject.id,
        name: Subject.name,
        teacher: Subject.teacher,
        room: Subject.room,
        info: Subject.info,
    }).from(Subject)
        .where(
            like(Subject.name, `%${q}%`)
        )
        .limit(limit)
        .offset(offset);
    return raw satisfies SubjectsData;
}
