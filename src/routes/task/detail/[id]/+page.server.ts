import type {PageServerLoad} from "./$types"
import {error} from "@sveltejs/kit";
import {db} from "$lib/server/DB";
import {Task, TaskStatus} from "$lib/schema";
import {and, eq, or} from "drizzle-orm";

export const load = (async ({parent, params}) => {
    const {session} = await parent()
    if (!session?.user) throw error(403, "Not logged in");
    if (!params.id) throw error(400, "Invalid params");
    return {
        streamed: {
            data: new Promise(async (resolve) => {
                if (!session?.user) throw error(403, "Not logged in");
                if (!params.id) throw error(400, "Invalid params");
                const data = await db.select({
                    id: Task.id,
                    title: Task.title,
                    limitDate: Task.limitDate,
                    limitTime: Task.limitTime,
                    description: Task.description,
                }).from(Task).where(
                        and(eq(Task.id, params.id),
                        or(
                            eq(Task.class, session.user.class),
                            eq(Task.user, session.user.id)
                        )
                    )
                ).then(v => v[0] ?? undefined);
                resolve(data)
            }),
            status: new Promise(async (resolve) => {
                if (!session?.user) throw error(403, "Not logged in");
                if (!params.id) throw error(400, "Invalid params");
                const data = await db.select({
                    id: TaskStatus.id,
                }).from(TaskStatus).where(
                    and(
                        eq(TaskStatus.task, params.id),
                        eq(TaskStatus.user, session.user.id)
                    )
                ).then(v => v[0]?.id ?? undefined);
                if (data === undefined) resolve(false);
                else resolve(true);
            })
        }
    }
}) satisfies PageServerLoad;