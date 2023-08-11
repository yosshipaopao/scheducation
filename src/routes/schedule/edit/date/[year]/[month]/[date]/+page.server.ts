import type {Actions, PageServerLoad} from './$types';
import {redirect} from "@sveltejs/kit";
import scheduleScript from "$lib/schedule";
import {db} from "$lib/server/db";
import {GetDateSchedule, GetDetailSubjects} from "$lib/server/schedule/Data";
import {subject} from "$lib/schema";
import {inArray} from "drizzle-orm";


export const load = (async ({params, parent}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
    const defaults = scheduleScript.defaults();
    const {year, month, date} = scheduleScript.check("week", params.year ?? defaults.year, params.month ?? defaults.month, params.date ?? defaults.date);
    const baseDate = new Date(year, month - 1, date);
    const data = await GetDateSchedule(db, baseDate);

    const defaultSubjects = await GetDetailSubjects(db, {special: [0]});
    const specialSubjects = await GetDetailSubjects(db, {special: [1]});
    return {
        slug: {
            year: year,
            month: month,
            date: date
        },
        data,
        defaultSubjects,
        specialSubjects
    }
}) satisfies PageServerLoad;

export const actions = {
    default: async ({params, request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw redirect(303, "/signin");
        const body = await request.formData();
        const data = JSON.parse(body.get("data") as string);
        const special = JSON.parse(body.get("special") as string);
        const defaults = scheduleScript.defaults();
        const {year, month, date} = scheduleScript.check("week", params.year ?? defaults.year, params.month ?? defaults.month, params.date ?? defaults.date);
        const baseDate = new Date(year, month - 1, date);
        const before = await GetDateSchedule(db, baseDate);

        const fixed = data.filter((v, i) =>  (v.subject !== "" && (v.subject !== before[i].subject.id ||v.subject !== before[i].subject.id ||v.belongings!==before[i].belongings ||v.memo !== before[i].memo)))
        const isOldIds=new Set<string>((await db.select({id:subject.id}).from(subject).where(inArray(subject.id,special.map((v: any) => v.id)))).map(v=>v.id as string));
        const isNewSubjects=special.filter((v:any)=>!isOldIds.has(v.id));

        console.log(fixed,isNewSubjects);
    }
}satisfies Actions;