import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db}from "$lib/server/newDB";
import {SearchSubjects} from "$lib/server/schedule/newDB";

export const GET = (async ({ url ,locals}) => {
    const session = await locals.getSession();
    if (!session?.user) throw error(403, "Not logged in");
    const q= url.searchParams.get('q');
    if(!q) throw error(400,"q is required");
    const limit=parseInt(url.searchParams.get('limit')??'50');
    const offset=parseInt(url.searchParams.get('offset')??'0');
    const result=await SearchSubjects(db,{q,limit,offset});
    return new Response(JSON.stringify(result),{headers:{'content-type':'application/json'}});
}) satisfies RequestHandler;