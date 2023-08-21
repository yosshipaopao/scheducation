import webpush from 'web-push';
import keys from "$lib/server/application-server-keys.json";
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db}from "$lib/server/DB";
import {NotificationKey} from "$lib/schema";
import {eq} from "drizzle-orm";

export const GET = (async ({locals}) => {
    const session = await locals.getSession();
    if (!session?.user) throw error(403, "Not logged in");
    const subscribers =await db.select({
        subscription:NotificationKey.subscription
    }).from(NotificationKey).where(eq(NotificationKey.user,session.user.id)).then(v=>v.map(v=>JSON.parse(v.subscription)));
    webpush.setVapidDetails(
        "mailto:yosshipaopao.work@gmail.com",
        keys.publicKey.publicKey,
        keys.publicKey.privateKey
    );
    const icon="/icon/logo.png"
    const payload=JSON.stringify({
        title:"テスト",
        body:"テスト",
        icon,
        target_url:"/setup",
    })
    const result=await Promise.all(subscribers.map(subscription=>webpush.sendNotification(subscription,payload)));
    return new Response(JSON.stringify(result),{headers:{'content-type':'application/json'}});
}) satisfies RequestHandler;