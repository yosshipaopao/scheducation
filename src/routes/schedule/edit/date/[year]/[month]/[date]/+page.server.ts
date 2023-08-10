import type {PageServerLoad} from './$types';
import {redirect} from "@sveltejs/kit";
import scheduleScript from "$lib/schedule";
import {db} from "$lib/server/db";
import {GetDefaultDateSchedule,GetDetailSubjects} from "$lib/server/schedule/Data";


export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
    const defaults = scheduleScript.defaults();
    const {year, month, date} = scheduleScript.check("week", params.year ?? defaults.year, params.month ?? defaults.month,params.date ?? defaults.date);
    const baseDate = new Date(year, month - 1, date);
    const day = baseDate.getDay();
    const data=await GetDefaultDateSchedule(db,day);

    const subjects = await GetDetailSubjects(db);

    return {
        slug: {
            year: year,
            month: month,
            date: date
        },
        data,
        subjects
    }
}) satisfies PageServerLoad;