import type {Actions} from "./$types";
import {error} from "@sveltejs/kit";
import {db} from "$lib/server/DB";
import {ClassEntry,users} from "$lib/schema";
import {and, eq} from "drizzle-orm";
export const actions = {
    default: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(403, "Not logged in");
        const form = await request.formData();
        const gradeStr = form.get('grade');
        const classStr = form.get('class');
        const grade = parseInt(gradeStr as string);
        const class_ = parseInt(classStr as string);
        if (isNaN(grade) || isNaN(class_)) throw error(400, "Invalid params");

        let ClassId=await db.select({
            id:ClassEntry.id
        }).from(ClassEntry).where(and(
            eq(ClassEntry.grade,grade),
            eq(ClassEntry.class,class_)
        )).then(v=>v[0]?.id??undefined);
        if(!ClassId) ClassId=await db.insert(ClassEntry).values({
            grade,class:class_
        }).returning().then(v=>v[0].id);

        await db.update(users).set({
            class: ClassId
        }).where(eq(users.id,session.user.id));

        return {
            success: true
        }
    }
}satisfies Actions;
