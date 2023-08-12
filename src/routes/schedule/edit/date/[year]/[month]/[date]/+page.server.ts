import type {Actions, PageServerLoad} from './$types';
import {redirect} from "@sveltejs/kit";
import scheduleScript from "$lib/schedule";
import {db} from "$lib/server/db";
import {GetDateSchedule, GetDetailSubjects} from "$lib/server/schedule/Data";
import {schedule, subject} from "$lib/schema";
import {and, eq, inArray, ne} from "drizzle-orm";


export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
    const defaults = scheduleScript.defaults();
    const {year, month, date} = scheduleScript.check("week", params.year ?? defaults.year, params.month ?? defaults.month, params.date ?? defaults.date);
    const baseDate = new Date(year, month - 1, date);
    const baseInt = scheduleScript.convertDate(year, month, date)
    const defaultSchedule = await db.select({
        time: schedule.time,
        subject: schedule.subject,
        belongings: schedule.belongings,
        memo: schedule.memo,
        special: schedule.special
    }).from(schedule).where(eq(schedule.date, baseDate.getDay())).orderBy(schedule.time);
    const specialSchedule = await db.select({
        time: schedule.time,
        subject: schedule.subject,
        belongings: schedule.belongings,
        memo: schedule.memo,
        special: schedule.special
    }).from(schedule).where(and(eq(schedule.date, baseInt), ne(schedule.special, 0)));
    const defaultSubjects = await GetDetailSubjects(db, {special: [0]});
    const specialSubjects = await GetDetailSubjects(db, {special: [1]});
    return {
        slug: {
            year: year,
            month: month,
            date: date
        },
        defaultSchedule,
        specialSchedule,
        defaultSubjects,
        specialSubjects
    }
}) satisfies PageServerLoad;

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
}satisfies Actions;