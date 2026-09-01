export function normalizeChecklistItem(value: FormDataEntryValue | null): string | null {
	const item = value?.toString().trim();
	return item || null;
}

export function normalizeChecklistBody(value: FormDataEntryValue | null): string | null {
	const body = value?.toString().trim();
	return body || null;
}
