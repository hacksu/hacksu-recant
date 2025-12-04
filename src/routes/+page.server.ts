import msbImage from '$lib/assets/images/msb.jpg';
import bowmanImage from '$lib/assets/images/bowman.jpg';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { location as locationTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Map building selectors to their imported images
const buildingImages: Record<string, string> = {
	msb: msbImage,
	bowman: bowmanImage
};

export const load: PageServerLoad = async () => {
	// Query the database for the current location information
	const dbLocation = await db.query.location.findFirst({
		where: eq(locationTable.id, 'current')
	});

	// If no location found in DB, use fallback data
	// In production, you might want to throw an error or return null
	const location = dbLocation
		? {
				time: dbLocation.time,
				location: {
					building: {
						name: dbLocation.buildingSelector === 'msb' ? 'Mathematical Sciences Building' : 'Bowman Hall',
						room: dbLocation.buildingRoom,
						image: buildingImages[dbLocation.buildingSelector] || msbImage,
						url: dbLocation.buildingUrl
					}
				},
				body: dbLocation.body || undefined
		  }
		: {
				// Fallback data if no DB entry exists
				time: 'Every Tuesday at 7:00 PM',
				location: {
					building: {
						name: 'Mathematical Sciences Building',
						room: 'Room 228',
						image: msbImage,
						url: 'https://map.concept3d.com/?id=568#!m/57924?s/msb'
					}
				},
				body: 'HacKSU teaches anyone, regardless of skill level or major, how to code.'
		  };

	return {
		location
	};
};

