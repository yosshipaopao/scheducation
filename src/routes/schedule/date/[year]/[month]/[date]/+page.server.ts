import type { PageServerLoad} from './$types';
import {db} from "$lib/server/newDB";
import {GetDateSchedule} from "$lib/server/schedule/newDB";
import type {DateSchedule} from "$lib/server/schedule/newDB";
import {error} from "@sveltejs/kit";
export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw error(403,"Not logged in")
    const year = parseInt(params.year);
    const month = parseInt(params.month);
    const date = parseInt(params.date);
    const isDate = new Date(year, month - 1, date).getDate() === date;
    if(!isDate) throw error(403,"Invalid params");
    return {
        slug: {year, month, date},
        streamed:{
            data:new Promise<DateSchedule>(async (resolve) => {
                const data = await GetDateSchedule(db, {year, month, date});
                resolve(data)
            })
        }
    }
}) satisfies PageServerLoad;