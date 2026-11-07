export const UPLOAD_CATEGORIES = {
	general: 'General',
	leadership: 'Leadership',
	meetings: 'Meetings',
	information: 'Information'
} as const;

export type UploadCategory = keyof typeof UPLOAD_CATEGORIES;

export function isUploadCategory(value: unknown): value is UploadCategory {
	return typeof value === 'string' && value in UPLOAD_CATEGORIES;
}

export function uploadDir(category: string): string {
	return category === 'general' ? 'uploads' : category;
}

export function uploadUrl(file: { category: string; filename: string }): string {
	return `/uploads/${uploadDir(file.category)}/${file.filename}`;
}
