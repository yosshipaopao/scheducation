import {redirect} from '@sveltejs/kit';
import type {PageServerLoad} from './$types';
import {db} from "$lib/server/db";
import scheduleScript from "$lib/schedule";
import type {MonthSchedule, WeekSchedule, DateSchedule} from "$lib/server/schedule/Data";
import {GetMonthSchedule, GetWeekSchedule, GetDateSchedule} from "$lib/server/schedule/Data";

export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
    const defaults = scheduleScript.defaults();
    const {mode, year, month, date} = scheduleScript.check(
        params.mode ?? defaults.mode,
        params.year ?? defaults.year,
        params.month ?? defaults.month,
        params.date ?? defaults.date);
    if (params.mode !== mode.toString() || params.year !== year.toString() || params.month !== month.toString() || params.date !== date.toString()) throw redirect(303, `/schedule/${mode}/${year}/${month}/${date}`);

    return {
        slug: {mode, year, month, date},
        streamed: {
            data: new Promise<MonthSchedule | WeekSchedule | DateSchedule>(async (resolve) => {
                if (mode == 'month') resolve(await GetMonthSchedule(db, new Date(year, month - 1, 1)));
                else if (mode == 'week') resolve(await GetWeekSchedule(db, new Date(year, month - 1, date)));
                else resolve(await GetDateSchedule(db, new Date(year, month - 1, date)));
            })
        }
    }

}) satisfies PageServerLoad;