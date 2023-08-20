import type {PageServerLoad, Actions} from "./$types"
import {error} from "@sveltejs/kit";
import {db} from "$lib/server/DB";
import {Task, TaskStatus} from "$lib/schema";
import {and, eq, isNull, or} from "drizzle-orm";
import * as crypto from "crypto";

interface TaskData {
    id: string,
    title: string,
    limitDate: number,
    limitTime: number
}

export const load = (async ({parent}) => {
    const {session} = await parent()
    if (!session?.user) throw error(403, "Not logged in");

    return {
        streamed: {
            data: new Promise<{
                unSubmitted: TaskData[],
                today: TaskData[],
                thisWeek: TaskData[],
                thisMonth: TaskData[],
                afterThisMonth: TaskData[]
            }>(async (resolve) => {
                const data = await db.select({
                    id: Task.id,
                    title: Task.title,
                    limitDate: Task.limitDate,
                    limitTime: Task.limitTime,
                }).from(Task).where(
                    and(
                        or(
                            eq(Task.class, session.user?.class),
                            eq(Task.user, session.user?.id)
                        ),
                        isNull(TaskStatus.id)
                    )
                ).leftJoin(TaskStatus, and(eq(Task.id, TaskStatus.task), eq(TaskStatus.user, session.user?.id))).orderBy(Task.limitDate, Task.limitTime)
                const unSubmitted: TaskData[] = [];
                const today: TaskData[] = [];
                const thisWeek: TaskData[] = [];
                const thisMonth: TaskData[] = [];
                const afterThisMonth: TaskData[] = [];

                const now = new Date();
                data.forEach((v) => {
                    if (v.id === undefined) return;

                    const date = new Date(Math.round(v.limitDate/10000), Math.round(v.limitDate%10000/100)-1, v.limitDate%100+1);//kokonaze +1
                    if (date.getTime() - now.getTime() < 0) {
                        unSubmitted.push(v);
                    } else if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
                        today.push(v);
                    } else if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
                        if (date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
                            thisWeek.push(v);
                        } else {
                            thisMonth.push(v);
                        }
                    } else {
                        afterThisMonth.push(v);
                    }
                })
                resolve({
                    unSubmitted,
                    today,
                    thisWeek,
                    thisMonth,
                    afterThisMonth
                })
            })
        }
    }
}) satisfies PageServerLoad;

export const actions = {
    add: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(403, "Not logged in");
        const form = await request.formData();
        const type = form.get("type");
        const title = form.get("title");
        const limitDate = form.get("deadline");
        const limitTime = form.get("time");
        const description = form.get("description");
        if (type === null || title === null || limitDate === null || limitTime === null || description === null) throw error(400, "Invalid params");
        await db.insert(Task).values({
            id: crypto.randomUUID() as string,
            class: type === "class" ? session.user.class as number : null,
            user: type === "user" ? session.user.id : undefined,
            limitDate: parseInt((limitDate as string).replaceAll("-", "")),
            limitTime: parseInt(limitTime as string),
            title: title,
            description: description
        });
        return {
            success: true
        }
    },
    done: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(403, "Not logged in");
        const form = await request.formData();
        const id = form.get("id");
        if (id === null) throw error(400, "Invalid params");
        await db.insert(TaskStatus).values({
            user: session.user.id as string,
            task: id as string
        });
        return {success: true}
    }
}satisfies Actions;