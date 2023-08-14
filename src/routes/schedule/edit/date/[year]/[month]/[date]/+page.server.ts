import type {Actions, PageServerLoad} from './$types';
import {error} from "@sveltejs/kit";
import {db} from "$lib/server/newDB";
import {  GetDefaultSubjects} from "$lib/server/schedule/newDB";
import type {DateSchedule, DateTimeSchedule} from "$lib/server/schedule/newDB";
import {DateEntry, Subject, TimeTable} from "$lib/newschema";
import {and, asc, desc, eq, inArray, isNull, or} from "drizzle-orm";


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
    }).from(DateEntry).where(eq(DateEntry.date, baseInt));

    const before: DateSchedule = [];
    const notUsedMap = new Map<number, DateTimeSchedule>();
    if (!(isHoliday.length > 0 && isHoliday[0].holiday)) {
        const raw = await db.select({
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
            or(isNull(DateEntry.holiday), eq(DateEntry.holiday, false))
        )).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).leftJoin(DateEntry, eq(TimeTable.date, DateEntry.date)).orderBy(desc(TimeTable.date), asc(TimeTable.time));
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
                else notUsedMap.set(v.time, {...data,special:false});
            } else {
                map.set(v.time, {...data,special:false});
            }
            maxTime = Math.max(maxTime, v.time) + 1;
        });

        for (let i = 0; i < maxTime; i++) before.push(map.get(i) ?? {
            time: i,
            name: "不明",
            teacher: "",
            room: "",
            info: "this is bug maybe...",
            special:true
        });
    }
    const defaultSubjects = await GetDefaultSubjects(db);
    return {
        slug: {year, month, date},
        defaultSubjects,
        notUsedSchedule: notUsedMap,
        data: before,
    }
}) satisfies PageServerLoad;

/*
export const actions = {
    default: async ({params, request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw redirect(303, "/signin");
        const body = await request.formData();
        const data = JSON.parse(body.get("data") as string);
        const special = JSON.parse(body.get("special") as string);
        const defaults = scheduleScript.defaults();
        const {year, month, date} = scheduleScript.check("week", params.year ?? defaults.year, params.month ?? defaults.month, params.date ?? defaults.date);
        const baseDate = new Date(year, month - 1, date);
        const baseInt = scheduleScript.convertDate(year, month, date)
        const before = await GetDateSchedule(db, baseDate);
        const specialSchedule = new Set((await db.select({
            time: schedule.time,
        }).from(schedule).where(eq(schedule.date, baseInt))).map(v => v.time));

        const add = [];
        const update = [];
        const del: number[] = [];
        for (let i = 0; i < Math.max(before.length, data.length); i++) {
            if (data[i].subject === "") continue;//無効判定
            if (!before[i]) add.push(data[i]);//追加(新規)
            else if (!data[i]) del.push(before[i].time);//削除(削除)
            else if (!data[i].special) {
                if (specialSchedule.has(i)) del.push(i);//通常の場合、特殊スケジュールがあれば削除
            } else if (before[i].subject.id !== data[i].subject || before[i].belongings !== data[i].belongings || before[i].memo !== data[i].memo) {//変更チェック
                if (specialSchedule.has(i)) update.push(data[i]);//もともと特殊スケジュールがあれば更新
                else add.push(data[i]);//なければ追加
            }
        }
        const isOldIds = special.length == 0 ? new Set<string>() : new Set<string>((await db.select({id: subject.id}).from(subject).where(inArray(subject.id, special.map((v: any) => v.id)))).map(v => v.id as string));
        const newSubjects = special.filter((v: any) => !isOldIds.has(v.id)).map((v: any) => ({...v, special: 1}));


        if (add.length > 0) await db.insert(schedule).values(add.map((v: any) => ({
            date: baseInt,
            time: v.time,
            subject: v.subject,
            belongings: v.belongings,
            memo: v.memo,
            special: v.unique ? 2 : 1
        })));
        for (const up of update) await db.update(schedule).set({
            subject: up.subject,
            belongings: up.belongings,
            memo: up.memo,
            special: up.unique ? 2 : 1
        }).where(and(eq(schedule.date, baseInt), eq(schedule.time, up.time)));
        if (del.length > 0) await db.delete(schedule).where(and(eq(schedule.date, baseInt), inArray(schedule.time, del)));

        if (newSubjects.length > 0) await db.insert(subject).values(newSubjects);
    }
    }
} satisfies Actions;*/
