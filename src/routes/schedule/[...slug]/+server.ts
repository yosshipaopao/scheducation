import {error, redirect} from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = (({ params }: { params: any }) => {
	const param = params.slug.split('/');
	let mode: string = param[0];
	if(!['month','week','date'].includes(mode)) mode = "week"
	let year =parseInt(param[1]??"");
	let month = parseInt(param[2]??"");
	let date = parseInt(param[3]??"");
	const isDate = new Date(year, month - 1, date).getDate() === date;
	if(!isDate) throw error(403,"Invalid params");
	throw redirect(303,`/schedule/${mode}/${year}/${month}/${date}`)
}) satisfies  RequestHandler;