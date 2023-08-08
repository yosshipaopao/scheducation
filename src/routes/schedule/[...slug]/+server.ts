import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import schedule from "$lib/schedule";

export const GET = (({ params }: { params: any }) => {
	const defaults =schedule.defaults();
	const param = params.slug.split('/');
	const today = new Date();
	let mode: string = param[0] ?? defaults.mode;
	let year: string = param[1] ?? defaults.year;
	let month: string = param[2] ?? defaults.month;
	let date: string = param[3] ?? defaults.date;
	const checked = schedule.check(mode, year, month, date);

	throw redirect(302, `/schedule/${checked.mode}/${checked.year}/${checked.month}/${checked.date}`);
}) satisfies  RequestHandler;