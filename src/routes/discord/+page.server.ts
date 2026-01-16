import { redirect } from '@sveltejs/kit';

export const load: any = async () => {
    return redirect(302, '/r/discord');
};
