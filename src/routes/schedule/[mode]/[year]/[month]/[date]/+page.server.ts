import {redirect} from '@sveltejs/kit';
import type {PageServerLoad} from './$types';
import {db} from "$lib/server/db";
import {schedule,subject} from "$lib/schema";
import {and, eq, gte, lte, inArray, or} from "drizzle-orm";
import scheduleScript from "$lib/schedule";

export const load = (async ({params, locals}: { params: any, locals: any }) => {
    const session = await locals.getSession();
    if (!session?.user) throw redirect(303, "/signin");
    const defaults = scheduleScript.defaults();
    const param = {
        mode: params.mode ?? defaults.mode,
        year: params.year ?? defaults.year,
        month: params.month ?? defaults.month,
        date: params.date ?? defaults.date,
    }
    const {mode, year, month, date} = scheduleScript.check(param.mode, param.year, param.month, param.date);
    if (params.mode !== mode.toString() || params.year !== year.toString()|| params.month !== month.toString() || params.date !== date.toString()) throw redirect(303, `/schedule/${mode}/${year}/${month}/${date}`);

    const data: any[] = [];
    if (mode == 'month') {
        const baseMonth = new Date(year, month - 1, 1);
        const startDate = new Date(baseMonth);
        startDate.setDate(-baseMonth.getDay() + 1);
        const finalDate = new Date(baseMonth);
        finalDate.setMonth(finalDate.getMonth()+1);
        finalDate.setDate(0)
        finalDate.setDate(finalDate.getDate() + (6 - finalDate.getDay()));

        const total = (finalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
        const start = scheduleScript.convertDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
        const final = scheduleScript.convertDate(finalDate.getFullYear(), finalDate.getMonth() + 1, finalDate.getDate());
        const scheduleData = await db.select({
            date: schedule.date,
            subject: schedule.subject,
        }).from(schedule).where(and(gte(schedule.date, start), lte(schedule.date, final)));

        const uniqueSchedule = new Map<number, string>();
        for (const schedule of scheduleData) uniqueSchedule.set(schedule.date as number, schedule.subject as string);

        const date = new Date(startDate);

        for (let i = 0; i < total; i++) {
            const dateInt = scheduleScript.convertDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
            const unique = uniqueSchedule.has(dateInt);
            data.push({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                date: date.getDate(),
                info: unique ? uniqueSchedule.get(dateInt) : "",
                unique
            });
            date.setDate(date.getDate() + 1);
        }
    } else if (mode == 'week') {
        const startDate = new Date(year, month - 1, date);
        const finalDate = new Date(startDate);
        startDate.setDate(startDate.getDate() - 3);
        finalDate.setDate(finalDate.getDate() + 3);
        const startDay = startDate.getDay();
        const start = scheduleScript.convertDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
        const final = scheduleScript.convertDate(finalDate.getFullYear(), finalDate.getMonth() + 1, finalDate.getDate());
        const scheduleData = await db.select({
            date: schedule.date,
            time: schedule.time,
            subject: schedule.subject
        }).from(schedule).where(or(and(gte(schedule.date,0),lte(schedule.date,7)),and(gte(schedule.date, start), lte(schedule.date, final)))).orderBy(schedule.date, schedule.time);


        const subjectsSet=new Set<string>();
        const defaultSchedule:string[][] = [[], [], [], [], [], [], []];
        const uniqueSchedule = new Map<number, { time:number,subject:string }[]>();
        for (const schedule of scheduleData) {
            const date = schedule.date as number;
            if(date>=0&&date<=7) {
                defaultSchedule[date].push(schedule.subject as string);
            }else{
                if (!uniqueSchedule.has(date)) {
                    uniqueSchedule.set(date, []);
                }
                uniqueSchedule.get(date)?.push({time:schedule.time as number, subject:schedule.subject as string});
            }
            subjectsSet.add(schedule.subject as string);
        }

        const subjectData = (await db.select({
            id: subject.id,
            short: subject.short,
        }).from(subject).where(inArray(subject.id, Array.from(subjectsSet))));

        const subjects = new Map<string, string>();
        for (const subject of subjectData) subjects.set(subject.id as string, subject.short as string);

        for (let i = 0; i < 7; i++) {
            const detail: { time:number,subject:string }[] = [];
            for (let j = 0; j < defaultSchedule[(startDay+i)%7].length; j++) detail.push({time:j+1,subject:subjects.get(defaultSchedule[(startDay+i)%7][j])??"不明"});

            const dateInt = scheduleScript.convertDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
            if (uniqueSchedule.has(dateInt)) {
                for (const subject of uniqueSchedule.get(dateInt) as { time:number,subject:string }[]){
                    if(detail.length<=subject.time) detail.push({
                        time:subject.time,
                        subject:subjects.get(subject.subject)??"不明"
                    });
                    else detail[subject.time]= {
                        time:subject.time,
                        subject:subjects.get(subject.subject)??"不明"
                    };
                }
            }
            data.push({
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                date: startDate.getDate(),
                data: detail
            });
            startDate.setDate(startDate.getDate() + 1);
        }
    } else {
        const baseDate = new Date(year, month - 1, date);

        const base = scheduleScript.convertDate(baseDate.getFullYear(), baseDate.getMonth() + 1, baseDate.getDate());
        const scheduleData = await db.select({
            time: schedule.time,
            subject: schedule.subject,
            belongings: schedule.belongings,
            memo: schedule.memo,
        }).from(schedule).where(eq(schedule.date, base));
        const day = baseDate.getDay();
        const rawData= await db.select().from(schedule).where(eq(schedule.date, day)).orderBy(schedule.time);
        //ここdefault
        const subjectsId:string[]= [];
        for(const d of rawData) subjectsId.push(d.subject as string);
        const subjects = new Map<string, { name:string,short:string }>();
        if(subjectsId.length !== 0) {
            const subjectData = await db.select({
                id: subject.id,
                name: subject.name,
                short: subject.short
            }).from(subject).where(inArray(subject.id, subjectsId));
            for (const d of subjectData) subjects.set(d.id as string, {
                name: d.name as string,
                short: d.short as string
            });
        }for(const d of rawData) {
            data.push({
                hour: d.time as number,
                subject: subjects.get(d.subject as string),
                detail: {
                    belongings: d.belongings as string,
                    memo: d.memo as string
                }
            });
        }
        for (const schedule of scheduleData) {
            const time = schedule.time as number;
            data[time] = {
                hour: time,
                subject: subjects.get(schedule.subject as string),
                detail: {
                    belongings: schedule.belongings as string,
                    memo: schedule.memo as string
                }
            };
        }
    }
    return {
        slug: {
            mode,
            year,
            month,
            date
        },
        data
    }

}) satisfies PageServerLoad;