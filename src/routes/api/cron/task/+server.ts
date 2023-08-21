import webpush from 'web-push';
import keys from "$lib/server/application-server-keys.json";
import type { RequestHandler } from './$types';
import {db}from "$lib/server/DB";
import {NotificationKey,Task,TaskStatus} from "$lib/schema";
import {and, eq, inArray, isNull, or} from "drizzle-orm";

export const GET = (async ({locals}) => {
    const now=new Date();
    const hour=now.getHours();
    const today=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
    now.setDate(now.getDate()-7);
    const past7days=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
    const data = await db.select({
        id:Task.id,
        user:Task.user,
        title:Task.title,
    }).from(Task).where(and(
        inArray(Task.limitDate,[today,past7days]),
        eq(Task.limitTime,hour),
        isNull(TaskStatus.id)
        )
    ).leftJoin(TaskStatus, eq(Task.id, TaskStatus.task)).orderBy(Task.limitDate, Task.limitTime)
    const users=data.map(v=>v.user);
    const subscribers =await db.select({
        user:NotificationKey.user,
        subscription:NotificationKey.subscription
    }).from(NotificationKey).where(inArray(NotificationKey.user,users));
    const subscribersMap=new Map<string,any>();
    subscribers.forEach(v=>subscribersMap.set(v.user,JSON.parse(v.subscription)));
    webpush.setVapidDetails(
        "mailto:yosshipaopao.work@gmail.com",
        keys.publicKey.publicKey,
        keys.publicKey.privateKey
    );
    const icon="/icon/logo.png"
    const result=await Promise.all(data.map(d=>{
        const payload=JSON.stringify({
            title:d.title,
            body:d.title,
            icon,
            target_url:`/task/detail/${d.id}`,
        })
        const subscription=subscribersMap.get(d.user);
        if(!subscription) return;
        return webpush.sendNotification(subscription,payload)
    }));
    return new Response(JSON.stringify(result),{headers:{'content-type':'application/json'}});
}) satisfies RequestHandler;