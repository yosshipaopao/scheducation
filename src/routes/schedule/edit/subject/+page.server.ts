import type {Actions, PageServerLoad} from "./$types";
import {error, redirect} from "@sveltejs/kit";
import {db} from "$lib/server/newDB";
import {Subject, TimeTable} from "$lib/newschema";
import {and, eq, isNull} from "drizzle-orm";

export const load = (async ({parent}) => {
    const {session} = await parent();
    if (!session?.user) throw redirect(303, "/signin");
    return {};
}) satisfies PageServerLoad;

export const actions = {
    delete: (async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(403, "Not logged in");
        const formData = await request.formData();
        const idStr = formData.get("id");
        if (!idStr) throw error(400, "id is required");
        const id = parseInt(idStr as string);
        if (isNaN(id)) throw error(400, "id must be a number");
        const subject = (await db.select({
            id: Subject.id,
        }).from(Subject).where(and(eq(Subject.id, id),isNull(TimeTable.id))).leftJoin(TimeTable, eq(Subject.id, TimeTable.subject))).map(v => v.id);
        if(subject.length===0) throw error(400,"Must be a subject that is not used in the timetable");
        else await db.delete(Subject).where(eq(Subject.id,id));
        return {
            success: true,
        }
    }),
} satisfies Actions;