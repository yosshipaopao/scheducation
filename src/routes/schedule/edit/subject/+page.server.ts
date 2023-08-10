import {db} from "$lib/server/db";
import {schedule, subject} from "$lib/schema";
import type {Actions, PageServerLoad} from "./$types";
import {error, redirect} from "@sveltejs/kit";
import {eq} from "drizzle-orm";
import { GetDetailSubjects} from "$lib/server/schedule/Data";

export const load = (async ({parent}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");

    const subjects = await GetDetailSubjects(db);

    return {subjects};
}) satisfies PageServerLoad;

export const actions = {
    default: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(401, "Unauthorized");
        const body = await request.formData();
        const type = body.get("type") as string;
        const newSubjectsData = JSON.parse(body.get("subject") as string);
        if(type==="Edit") {
            await db.update(subject).set({
                name: newSubjectsData.name,
                short: newSubjectsData.short,
                teacher: newSubjectsData.teacher,
                room: newSubjectsData.room,
                memo: newSubjectsData.memo,
            }).where(eq(subject.id, newSubjectsData.id));
        }else if(type==="Add"){
            await db.insert(subject).values({
                id: newSubjectsData.id,
                name: newSubjectsData.name,
                short: newSubjectsData.short,
                teacher: newSubjectsData.teacher,
                room: newSubjectsData.room,
                memo: newSubjectsData.memo, 
            });
        }else if(type==="Delete") {
            const check = await db.select().from(schedule).where(eq(schedule.subject, newSubjectsData.id)).limit(1);
            if (check.length === 0) await db.delete(subject).where(eq(subject.id, newSubjectsData.id));
            else throw error(403, "Used Subject");
        }
    }
} satisfies Actions;