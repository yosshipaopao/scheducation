import type {PageServerLoad} from "./$types";
import {redirect} from "@sveltejs/kit";
import {db} from "$lib/server/newDB";
import {DateEntry, TimeTable} from "$lib/newschema";
import {and, eq, gte, lte, ne, or, sql} from "drizzle-orm";

export const load: PageServerLoad = async ({parent, params}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
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
                    info: string
                }[]>(async (resolve) => {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                startDate.setDate(startDate.getDate() - startDate.getDay());
                endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
                const startInt = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
                const endInt = endDate.getFullYear() * 10000 + (endDate.getMonth() + 1) * 100 + endDate.getDate();
                const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const raw = await db.select({
                    date: DateEntry.date,
                    holiday: DateEntry.holiday,
                    info: DateEntry.info,
        special: sql<boolean>`CASE WHEN ${eq(TimeTable.date,DateEntry.date)} THEN ${false} ELSE ${true} END`.as("special"),
                }).from(DateEntry).where(and(or(gte(DateEntry.date, startInt), lte(DateEntry.date, endInt)), ne(DateEntry.holiday, true)));
                const map = new Map<number, {
                    date: number,
                    holiday: boolean,
                    defaultHoliday: boolean,
                    info: string
                }>();
                raw.forEach(v => map.set(v.date, {...v, defaultHoliday: false}));
                //整形
                const result:{
                    date: number,
                    holiday: boolean,
                    defaultHoliday: boolean,
                    info: string
                }[] = [];
                for (let i = 0; i < total; i++) {
                    const n = startDate.getFullYear() * 10000 + (startDate.getMonth() + 1) * 100 + startDate.getDate();
                    const d = startDate.getDay();
                    result.push(map.get(n) ?? map.get(d) ?? {date: n, holiday: true, defaultHoliday: true, info: ""});
                    startDate.setDate(startDate.getDate() + 1);
                }
                resolve(result)
            })
        }
    }
}