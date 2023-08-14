import type { PageServerLoad} from './$types';
import {db} from "$lib/server/newDB";
import {GetMonthSchedule} from "$lib/server/schedule/newDB";
import type {MonthSchedule} from "$lib/server/schedule/newDB";
import {error} from "@sveltejs/kit";
export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw  error(403,"Not logged in")
    const year = parseInt(params.year);
    const month = parseInt(params.month);
    if(isNaN(year) || isNaN(month)|| month<0 || month > 12) throw error(403,"Invalid year or month");
    return {
        slug: {year,month},
        streamed:{
            data:new Promise<MonthSchedule>(async (resolve) => {
                const data = await GetMonthSchedule(db, {year, month});
                resolve(data)
            })
        }
    }
}) satisfies PageServerLoad;