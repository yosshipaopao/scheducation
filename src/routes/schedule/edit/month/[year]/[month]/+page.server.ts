import type {PageServerLoad, Actions} from "./$types";
import {error, redirect} from "@sveltejs/kit";
import {db} from "$lib/server/DB";
import {DateEntry, TimeTable} from "$lib/schema";
import {between, eq, inArray, or} from "drizzle-orm";

export const load = (async ({parent, params}) => {
    const {session} = await parent();
    if (!session?.user) throw error(403, "Not logged in");
    const year = parseInt(params.year);
    const month = parseInt(params.month);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) throw redirect(303, "/schedule/edit");


    return {
        slug: {year, month},
        streamed: {
            data: new Promise<{
                date: number,
                holiday: boolean,
                defaultHoliday: boolean,
                special: boolean,
                info: string
            }[]>(async (resolve) => {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                startDate.setDate(startDate.getDate() - startDate.getDay());
                endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
                const startInt = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
                const endInt = endDate.getFullYear() * 10000 + (endDate.getMonth() + 1) * 100 + endDate.getDate();
                const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const hasSchedule = new Set((await db.selectDistinct({
                    date: TimeTable.date,
                }).from(TimeTable).where(or(
                    between(TimeTable.date, 0, 6),
                    between(TimeTable.date, startInt, endInt))
                )).map(v => v.date));
                const raw = await db.select({
                    date: DateEntry.date,
                    holiday: DateEntry.holiday,//OverRide Holiday Check
                    info: DateEntry.info,//Add Info Check
                }).from(DateEntry)
                    .where(
                        between(DateEntry.date, startInt, endInt)
                    );
                const holidayMap = new Set<number>();
                const infoMap = new Map<number, string>();
                raw.forEach(v => {
                    if (v.holiday) holidayMap.add(v.date);
                    if (v.info && v.info !== "") infoMap.set(v.date, v.info);
                });
                const result: {
                    date: number,
                    holiday: boolean,
                    defaultHoliday: boolean,
                    special: boolean,
                    info: string
                }[] = [];
                for (let i = 0; i < total; i++) {
                    const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
                    const d = startDate.getDay();
                    result.push(
                        {
                            date: n,
                            holiday: holidayMap.has(n) ? true : !hasSchedule.has(d) && !hasSchedule.has(n),
                            defaultHoliday: !hasSchedule.has(d) && !hasSchedule.has(n),
                            special: hasSchedule.has(n),
                            info: infoMap.get(n) ?? "",
                        }
                    )
                    startDate.setDate(startDate.getDate() + 1);
                }
                resolve(result)
            })
        }
    }
}) satisfies PageServerLoad;

export const actions = {
    default: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(403, "Not logged in");
        const formData = await request.formData();
        const dataStr = formData.get('data');
        if (!dataStr) throw error(400, "data is required");
        if (typeof dataStr !== "string") throw error(400, "data must be string");
        const data = JSON.parse(dataStr);
        if (!Array.isArray(data)) throw error(400, "data must be correct format");

        const map = new Map<number, boolean>();

        for (const v of data) {
            const date = parseInt(v[0]);
            const holiday = v[1] === true || v[1] === "true";
            if (isNaN(date) || date < 7) continue;
            map.set(date, holiday);
        }
        const already = new Set((await db.select({
            date: DateEntry.date,
        }).from(DateEntry).where(inArray(DateEntry.date, Array.from(map.keys())))).map(v => v.date));
        const ins: { date: number, holiday: boolean,class:number,day:number }[] = [];
        const upd: { date: number, holiday: boolean }[] = [];
        map.forEach((v, k) => {
            const day = new Date(k).getDay();
            if (already.has(k)) upd.push({date: k, holiday: v});
            else ins.push({date: k, holiday: v,class:-1,day});
        });

        if(ins.length>0) await db.insert(DateEntry).values(ins)
        for (const v of upd) await db.update(DateEntry).set({holiday: v.holiday}).where(eq(DateEntry.date, v.date))

        return {
            success: true,
        }
    }
} satisfies Actions;