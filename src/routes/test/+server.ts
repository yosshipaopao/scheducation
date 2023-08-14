import {db} from "$lib/server/newDB";
import type {RequestHandler} from './$types';
import {SearchSubjects} from "$lib/server/schedule/newDB";

export const GET = (async () => {
    const year = 2023;
    const month = 8;
    const date = 13;
    const result=await SearchSubjects(db,{q:"b"});

    return new Response(JSON.stringify(result, null, 2))
})satisfies RequestHandler;