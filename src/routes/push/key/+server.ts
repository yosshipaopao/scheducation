import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db}from "$lib/server/DB";
import {NotificationKey} from "$lib/schema";
import {eq} from "drizzle-orm";

export const POST = (async ({ request ,locals}) => {
    const session = await locals.getSession();
    if (!session?.user) throw error(403, "Not logged in");
    const body=await request.json();
    const subscription=body.subscription;
    if(!subscription) throw error(400,"subscription is required");
    const subscriptionJSON=JSON.stringify(subscription);
    const result=await db.select({
        user:NotificationKey.user
    }).from(NotificationKey).where(eq(NotificationKey.user,session.user.id)).then(v=>v.map(v=>v.user));
    if(result.length>0) await db.update(NotificationKey).set({
        subscription:subscriptionJSON
    }).where(eq(NotificationKey.user,session.user.id));
    else await db.insert(NotificationKey).values({
        user:session.user.id,
        subscription:subscriptionJSON
    })
    return new Response(JSON.stringify({
        success:true
    }),{headers:{'content-type':'application/json'}});
}) satisfies RequestHandler;