import type {PageServerLoad} from "./$types";
import {redirect} from "@sveltejs/kit";
import scheduleScript from "$lib/schedule";
import {db} from "$lib/server/db";
import {schedule} from "$lib/schema";
import {and, gte, lte, or} from "drizzle-orm";

export const load: PageServerLoad = async ({parent, params}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
    const year = parseInt(params.year);
    const month = parseInt(params.month);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) throw redirect(303, "/schedule/edit");

    const startDate = new Date(year, month - 1, 1);
    startDate.setDate(-startDate.getDay() + 1);
    const finalDate = new Date(year, month, 0);
    finalDate.setDate(finalDate.getDate() + 6 - finalDate.getDay());
    const startInt = scheduleScript.convertDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    const finalInt = scheduleScript.convertDate(finalDate.getFullYear(), finalDate.getMonth() + 1, finalDate.getDate());
    const data = await db.selectDistinct({
        date: schedule.date,
    }).from(schedule).where(or(and(lte(schedule.date, finalInt), gte(schedule.date, startInt)),lte(schedule.date,6))).orderBy(schedule.date);

    return{
        slug: {
            year: year,
            month: month
        },
        totalDate: Math.floor((finalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        data: data
    }
}