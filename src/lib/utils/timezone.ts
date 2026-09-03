export const MEETING_TIMEZONE = 'America/New_York';

export function zonedDateTimeLocalToUtc(
	dateTimeLocal: string,
	timeZone: string = MEETING_TIMEZONE
): Date {
	const [datePart, timePart] = dateTimeLocal.split('T');
	const [year, month, day] = datePart.split('-').map(Number);
	const [hour, minute] = (timePart || '00:00').split(':').map(Number);

	const utcGuess = Date.UTC(year, month - 1, day, hour, minute);

	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).formatToParts(new Date(utcGuess));

	const map: Record<string, string> = {};
	for (const part of parts) map[part.type] = part.value;

	const asUtc = Date.UTC(
		Number(map.year),
		Number(map.month) - 1,
		Number(map.day),
		Number(map.hour),
		Number(map.minute),
		Number(map.second)
	);

	return new Date(utcGuess - (asUtc - utcGuess));
}

export function getZonedMonthYear(
	date: Date,
	timeZone: string = MEETING_TIMEZONE
): { month: number; year: number } {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: 'numeric'
	}).formatToParts(date);

	const map: Record<string, string> = {};
	for (const part of parts) map[part.type] = part.value;

	return { month: Number(map.month) - 1, year: Number(map.year) };
}

export function utcToZonedDateTimeLocal(
	date: Date,
	timeZone: string = MEETING_TIMEZONE
): string {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	}).formatToParts(date);

	const map: Record<string, string> = {};
	for (const part of parts) map[part.type] = part.value;

	return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}
