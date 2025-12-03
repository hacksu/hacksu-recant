import { requireAdmin } from '$lib/server/admin';

import type { LayoutServerLoad } from './$types';



export const load: LayoutServerLoad = async (event) => {

	await requireAdmin(event);

	return {};

};

