import webpush from 'web-push';
import keys from "$lib/server/application-server-keys.json";
import type { RequestHandler } from './$types';
import {db}from "$lib/server/DB";
import {DateEntry, NotificationKey, TimeTable,users} from "$lib/schema";
import {eq, inArray} from "drizzle-orm";

export const GET = (async ({locals}) => {
    const now=new Date();
    now.setDate(now.getDate()+1);
    const next=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
    const data = await db.select({
        class:TimeTable.class,
    }).from(TimeTable).where(eq(TimeTable.date,next))
    const dates=await db.select({
        class:DateEntry.class,
        holiday:DateEntry.holiday,
    }).from(DateEntry).where(eq(DateEntry.date,next));
    const holidayClass=new Set(dates.filter(v=>v.holiday).map(v=>v.class));
    const specialClass=data.map(v=>v.class);
    const notificationClass=new Set(specialClass.filter(v=>!holidayClass.has(v)));

    const subscribers =await db.select({
        subscription:NotificationKey.subscription
    }).from(users).innerJoin(NotificationKey, eq(users.id, NotificationKey.user)).where(inArray(users.class,Array.from(notificationClass)));
    webpush.setVapidDetails(
        "mailto:yosshipaopao.work@gmail.com",
        keys.publicKey.publicKey,
        keys.publicKey.privateKey
    );
    const icon="/icon/logo.png"
    const result=await Promise.all(subscribers.map(d=>{
        const payload=JSON.stringify({
            title:"明日の時間割",
            body:"明日の時間割は特別です。",
            icon
        })
        const subscription=JSON.parse(d.subscription);
        if(!subscription) return;
        return webpush.sendNotification(subscription,payload)
    }));
    return new Response(JSON.stringify(result),{headers:{'content-type':'application/json'}});
}) satisfies RequestHandler;