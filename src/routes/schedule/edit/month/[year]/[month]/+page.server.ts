import type {PageServerLoad} from "./$types";
import {redirect} from "@sveltejs/kit";
import {db} from "$lib/server/newDB";
import {DateEntry, TimeTable} from "$lib/newschema";
import {between,  or} from "drizzle-orm";

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
}