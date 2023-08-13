import {db} from "$lib/server/newDB";
import type { RequestHandler } from './$types';
import {GetDateSchedule, GetWeekSchedule} from "$lib/server/schedule/newDB";

export const GET = (async () => {
    const result = await GetDateSchedule(db, {year: 2023, month: 8, date: 4});
    return new Response(JSON.stringify(result, null, 2))
})satisfies RequestHandler;