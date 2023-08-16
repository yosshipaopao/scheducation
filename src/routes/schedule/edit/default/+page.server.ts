import {error, redirect} from "@sveltejs/kit";
import type {PageServerLoad, Actions} from "./$types";
import {Subject, TimeTable} from "$lib/schema";
import {and, between, eq} from "drizzle-orm";
import {db} from "$lib/server/DB";

export const load = (async ({locals}: { locals: any }) => {
    const session = await locals.getSession();
    if (!session?.user) throw redirect(303, "/signin");
    const raw = await db.select({
        date: TimeTable.date,
        time: TimeTable.time,
        name: Subject.name,
        id: Subject.id,
    }).from(TimeTable).where(between(TimeTable.date, 0, 6)
    ).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).orderBy(TimeTable.time);
    const map = new Map<number, Map<number, {
        date: number,
        time: number,
        name: string,
        id: number,
    }>>();
    raw.forEach(v => {
        if (!map.has(v.date)) map.set(v.date, new Map<number, {
            date: number,
            time: number,
            name: string,
            id: number,
        }>());
        map.get(v.date)?.set(v.time, {...v, id: v.id ?? -1, name: v.name ?? ""});
    });

    const result: {
        date: number,
        time: number,
        name: string,
        id: number,
    }[][] = [[], [], [], [], [], [], []];
    for (let i = 0; i < 7; i++) {
        let m = 0;
        const d = map.get(i);
        d?.forEach((v) => {
            m = Math.max(m, v.time + 1);
        })
        for (let j = 0; j < m; j++) {
            result[i].push(d?.get(j) ?? ({
                date: i,
                time: j,
                name: "休み",
                id: -1,
            }));
        }
    }
    return {
        data: result,
    };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({request, locals}) => {
        const session = await locals.getSession();
        if (!session?.user) throw error(401, "Unauthorized");
        const form = await request.formData();
        const data = form.get("data") as string;
        const json = JSON.parse(data);
        if(!Array.isArray(json)) throw error(400, "Invalid data");

        const raw = await db.select({
            date: TimeTable.date,
            time: TimeTable.time,
            name: Subject.name,
            id: Subject.id,
        }).from(TimeTable).where(between(TimeTable.date, 0, 6)
        ).leftJoin(Subject, eq(TimeTable.subject, Subject.id)).orderBy(TimeTable.time);
        const map = new Map<number, Map<number, {
            date: number,
            time: number,
            name: string,
            id: number,
        }>>();
        raw.forEach(v => {
            if (!map.has(v.date)) map.set(v.date, new Map<number, {
                date: number,
                time: number,
                name: string,
                id: number,
            }>());
            map.get(v.date)?.set(v.time, {...v, id: v.id ?? -1, name: v.name ?? ""});
        });
        const ins:{
            class:number,
            date:number,
            time:number,
            subject:number,
        }[]=[];
        const upd:{
            class:number,
            date:number,
            time:number,
            subject:number,
        }[]=[];
        const del:{date:number,id:number}[]=[];
        for (let i=0; i<7; i++) {
            if(!Array.isArray(json[i])) throw error(400, "Invalid data");
            const m=map.get(i);
            for(const v of json[i]) {
                const n=m?.get(v.time);
                if(!n&&v.id===-1) continue;
                if(!!n&&n.id===v.id) continue;
                if(!n&&v.id!==-1) {
                    ins.push({
                        class:-1,
                        date:i,
                        time:v.time,
                        subject:v.id,
                    });
                }else if(!!n&&v.id===-1) {
                    del.push({
                        date:i,
                        id:n.id,
                    });
                }else if(!!n&&n.id!==v.id) {
                    upd.push({
                        class:-1,
                        date:i,
                        time:v.time,
                        subject:v.id,
                    });
                }
            }
        }

        if(ins.length>0) await db.insert(TimeTable).values(ins)
        for(const v of upd) await db.update(TimeTable).set({subject:v.subject,}).where(and(eq(TimeTable.date,v.date), eq(TimeTable.time,v.time)))
        for(const v of del) await db.delete(TimeTable).where(and(eq(TimeTable.date,v.date), eq(TimeTable.subject,v.id)))

        return {
            success: true,
        }
    }
} satisfies Actions;