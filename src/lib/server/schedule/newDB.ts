import type {db} from "$lib/server/newDB";
import {DateEntry, TimeTable, Subject} from "$lib/newschema";
import {and, eq, gte, lte, ne, or, sql, isNull, between} from "drizzle-orm";

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
    const hasSchedule=await DB.selectDistinct({
        date:TimeTable.date,
    }).from(TimeTable).where(or(
        between(TimeTable.date,0,6),
        between(TimeTable.date,startInt,endInt))
    );
    const TimeTableDates=new Set<number>(
        hasSchedule.map(v=>v.date)
    );

    //holidayがtrueの時はSP関係なく休日
    //infoは休日関係なく表示
    const dates=await DB.select({
        date:DateEntry.date,
        holiday:DateEntry.holiday,//OverRide Holiday Check
        info:DateEntry.info,//Add Info Check
    }).from(DateEntry)
        .where(
            between(DateEntry.date,startInt,endInt)
        )
    const holidayMap=new Set<number>();
    const infoMap=new Map<number,string>();
    dates.forEach(v=>{
        if(v.holiday) holidayMap.add(v.date);
        if(v.info&&v.info!=="") infoMap.set(v.date,v.info);
    });

    const result:{date:number,holiday:boolean,special:boolean,info:string}[]=[];
    for (let i = 0; i < total; i++) {
        const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
        const d = startDate.getDay();
        result.push(
            {
                date: n,
                holiday: holidayMap.has(n)?true:!TimeTableDates.has(d)&&!TimeTableDates.has(n),
                special: TimeTableDates.has(n),
                info: infoMap.get(n)??"",
            }
        )
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
    const holidays = new Set((await DB.select({
        date: DateEntry.date,
    }).from(DateEntry).where(and(
            between(DateEntry.date, startInt, endInt),
            eq(DateEntry.holiday, true)
        )
    )).map(v => v.date));
    const raw = await DB.select({
        date: TimeTable.date,
        time: TimeTable.time,
        name: Subject.name,
    }).from(TimeTable).where(
        or(
            between(TimeTable.date, 0, 6),
            between(TimeTable.date, startInt, endInt)
        )
    ).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).orderBy(TimeTable.time);
    const map = new Map<number, WeekDateSchedule>();
    raw.forEach(v => {
        if(!map.has(v.date)) map.set(v.date,[]);
        map.get(v.date)?.push({...v,name:v.name??"",special:v.date>6});
    });

    const result:WeekSchedule= [];
    for (let i = 0; i < 7; i++) {
        const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
        const d = startDate.getDay();
        result.push([]);
        if(!holidays.has(n)) {
            const m = Math.max(...(map.get(d)?.map(v => v.time+1) ?? [0]), ...(map.get(n)?.map(v => v.time+1) ?? [0]));
            for(let j=0;j<m;j++)result[i].push(map.get(n)?.[j]??map.get(d)?.[j]??({date:n,time:j,name:"this is bug maybe...",special:false}));
        }
        startDate.setDate(startDate.getDate() + 1);
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