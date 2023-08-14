import {db} from "$lib/server/newDB";
import type {RequestHandler} from './$types';
import type {
    WeekDateSchedule,
    WeekSchedule
} from "$lib/server/schedule/newDB";
import {and, between, eq, gte, inArray, isNull, lte, ne, notInArray, or, sql} from "drizzle-orm";
import {DateEntry, Subject, TimeTable} from "$lib/newschema";
import {GetWeekSchedule} from "$lib/server/schedule/newDB";

export const GET = (async () => {
    const year = 2023;
    const month = 8;
    const date = 14;
    const result=await GetWeekSchedule(db, {year, month, date});
    return new Response(JSON.stringify(result, null, 2))
})satisfies RequestHandler;