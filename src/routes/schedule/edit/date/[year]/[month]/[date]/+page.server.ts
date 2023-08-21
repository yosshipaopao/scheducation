import type {Actions, PageServerLoad} from './$types';
import {error} from "@sveltejs/kit";
import {db} from "$lib/server/DB";
import {GetDefaultSubjects} from "$lib/server/schedule/DB";
import {DateEntry, Subject, TimeTable} from "$lib/schema";
import {and, asc, desc, eq, inArray, isNull, or} from "drizzle-orm";

interface EditDateTimeSchedule {
    time: number,
    name: string,
    teacher: string,
    room: string,
    info: string,
    special: boolean,
    unknown: boolean,
    id: number
}

type EditDateSchedule = EditDateTimeSchedule[];

export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw error(403, "Not logged in");
    const year = parseInt(params.year);
    const month = parseInt(params.month);
    const date = parseInt(params.date);
    const isDate = new Date(year, month - 1, date).getDate() === date;
    if (!isDate) throw error(403, "Invalid params");

    const baseDate = new Date(year, month - 1, date);
    const day = baseDate.getDay();
    const baseInt = year * 10000 + month * 100 + date;
    //check is holiday
    const isHoliday = await db.selectDistinct({
        holiday: DateEntry.holiday,
    }).from(DateEntry).where(and(
        eq(DateEntry.date, baseInt),
        eq(DateEntry.class, session.user?.class)
    ));

    const defaultSubjects = await GetDefaultSubjects(db, {userClass: session.user?.class});
    const before: EditDateSchedule = [];
    const notUsedMap = new Map<number, EditDateTimeSchedule>();
    const raw = await db.select({
        date: TimeTable.date,
        time: TimeTable.time,
        spInfo: TimeTable.info,
        spRoom: TimeTable.room,
        name: Subject.name,
        teacher: Subject.teacher,
        room: Subject.room,
        info: Subject.info,
        id: Subject.id
    }).from(TimeTable).where(and(
        inArray(TimeTable.date, [baseInt, day]),
        or(isNull(DateEntry.holiday), eq(DateEntry.holiday, false)),
        eq(TimeTable.class, session.user?.class)
    )).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).leftJoin(DateEntry, eq(TimeTable.date, DateEntry.date)).orderBy(desc(TimeTable.date), asc(TimeTable.time));

    const isDefault = new Set<number>(defaultSubjects.map(v => v.id));
    const map = new Map<number, EditDateTimeSchedule>();
    let maxTime = 0;
    raw.forEach(v => {
        const data = {
            time: v.time,
            name: v.name ?? "不明",
            teacher: v.teacher ?? "",
            room: v.spRoom.length ?? 0 > 0 ? v.spRoom : v.room ?? "",
            info: v.spInfo.length ?? 0 > 0 ? v.spInfo : v.info ?? "",
            id: v.id ?? -1
        }
        if (map.has(v.time)) {
            if (v.date > 6) map.set(v.time, {...data, special: !isDefault.has(data.id), unknown: false});
            else notUsedMap.set(v.time, {...data, special: false, unknown: false});
        } else {
            map.set(v.time, {...data, special: !(isDefault.has(data.id) && v.date <= 6), unknown: false});
        }
        maxTime = Math.max(maxTime, v.time + 1);
    });
    if (!(isHoliday.length > 0 && isHoliday[0].holiday)) {
        for (let i = 0; i < maxTime; i++) before.push(map.get(i) ?? {
            time: i,
            name: "なし",
            teacher: "",
            room: "",
            info: "休み",
            special: true,
            unknown: true,
            id: -1
        });
    } else {
        notUsedMap.clear()
        for (let i = 0; i < maxTime; i++) {
            const d = map.get(i);
            if (d) notUsedMap.set(i, {...d, unknown: false});
        }
    }
    return {
        slug: {year, month, date},
        defaultSubjects,
        notUsedSchedule: notUsedMap,
        data: before,
    }
}) satisfies PageServerLoad;


export const actions = {
    default: async ({params, request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(403, "Not logged in");
        const year = parseInt(params.year);
        const month = parseInt(params.month);
        const date = parseInt(params.date);
        const isDate = new Date(year, month - 1, date).getDate() === date;
        if (!isDate) throw error(403, "Invalid params");
        const day = new Date(year, month - 1, date).getDay();
        const baseInt = year * 10000 + month * 100 + date;
        const formData = await request.formData();
        const data = formData.get('data');
        if (!data) throw error(400, "data is required");
        if (typeof data !== "string") throw error(400, "data must be string");
        const parsedData = JSON.parse(data as string);
        if (!Array.isArray(parsedData)) throw error(400, "data must be correct format");

        const raw = await db.select({
            date: TimeTable.date,
            time: TimeTable.time,
            info: TimeTable.info,
            room: TimeTable.room,
            id: TimeTable.subject,
            sInfo: Subject.info,
            sRoom: Subject.room
        }).from(TimeTable).where(and(
            inArray(TimeTable.date, [baseInt, day]),
            eq(TimeTable.class, session.user?.class))
        ).orderBy(TimeTable.time).leftJoin(Subject, eq(TimeTable.subject, Subject.id));
        const defaultMap = new Map<number, {
            id: number,
            room: string,
            info: string
        }>();
        const specialMap = new Map<number, {
            id: number,
            room: string,
            info: string
        }>();
        let maxTime = -1;
        for (const v of raw) {
            if (v.date > 6) {
                specialMap.set(v.time, {
                    id: v.id,
                    room: v.room,
                    info: v.info
                })
            } else {
                defaultMap.set(v.time, {
                    id: v.id,
                    room: v.room !== "" ? v.room : v.sRoom ?? "",
                    info: v.info !== "" ? v.info : v.sInfo ?? ""
                })
            }
            maxTime = Math.max(maxTime, v.time);
        }
        maxTime = Math.max(maxTime, parsedData.length - 1);
        const insertData: any[] = [];
        const updateData: any[] = [];
        const deleteData: number[] = [];
        for (let i = 0; i < maxTime + 1; i++) {
            const defaultData = defaultMap.get(i);
            const specialData = specialMap.get(i);
            const data = parsedData[i];
            if (!data) {
                if (!!defaultData || !!specialData) deleteData.push(i);
                continue;
            }

            if (!defaultData && !specialData && data.special) {
                if (data.id !== -1 && !data.unknown) insertData.push({
                    class: session.user?.class,
                    date: baseInt,
                    time: i,
                    subject: data.id,
                    room: data.room,
                    info: data.info
                })
            } else if (specialData) {
                if (data.id === -1 || data.unknown) deleteData.push(i);
                else if (!data.special) deleteData.push(i);
                else if (specialData.id !== data.id || specialData.room !== data.room || specialData.info !== data.info) {
                    if (defaultData && (defaultData.info === data.info && defaultData.room === data.room)) {
                        deleteData.push(i);
                    } else updateData.push({
                        date: baseInt,
                        time: i,
                        subject: data.id,
                        room: data.room,
                        info: data.info
                    })
                }
            } else if (defaultData) {
                console.log(defaultData, data);
                if (data.id !== -1 && !data.unknown && (data.id !== defaultData.id.toString() || data.room !== defaultData.room || data.info !== defaultData.info)) insertData.push({
                    class: session.user?.class,
                    date: baseInt,
                    time: i,
                    subject: data.id,
                    room: data.room,
                    info: data.info
                });
            }
        }

        if (insertData.length > 0) await db.insert(TimeTable).values(insertData);
        for (const v of updateData) await db.update(TimeTable).set(v).where(and(eq(TimeTable.date, v.date), eq(TimeTable.time, v.time), eq(TimeTable.class, session.user?.class)));
        if (deleteData.length > 0) await db.delete(TimeTable).where(and(eq(TimeTable.date, baseInt), inArray(TimeTable.time, deleteData), eq(TimeTable.class, session.user?.class)));

        if (insertData.length > 0 || updateData.length > 0) await db.update(DateEntry).set({holiday: false}).where(and(eq(DateEntry.date, baseInt), eq(DateEntry.class, session.user?.class)));
    }
}satisfies Actions;
