import { mkdir, readdir, stat, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { uploadedFiles } from '$lib/server/db/schema';
import { getAdminUser } from '$lib/server/admin';
import { uploadDir, uploadUrl, type UploadCategory } from '$lib/uploads';

export const uploadsRoot = join(process.cwd(), 'static', 'uploads');

export async function saveUpload(file: File, category: UploadCategory, uploadedBy: string): Promise<string> {
	const filename = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
	const dir = join(uploadsRoot, uploadDir(category));
	await mkdir(dir, { recursive: true });
	const destPath = join(dir, filename);
	await writeFile(destPath, Buffer.from(await file.arrayBuffer()));

	try {
		await db.insert(uploadedFiles).values({
			id: randomUUID(),
			filename,
			category,
			originalName: file.name,
			mimeType: file.type || 'application/octet-stream',
			sizeBytes: file.size,
			uploadedBy
		});
	} catch (error) {
		await unlink(destPath).catch(() => {});
		throw error;
	}

	return uploadUrl({ category, filename });
}

export async function photoFromForm(event: RequestEvent, formData: FormData, category: UploadCategory): Promise<string | null> {
	const file = formData.get('photo');
	if (file instanceof File && file.size > 0) {
		return saveUpload(file, category, (await getAdminUser(event)) ?? 'unknown');
	}
	return formData.get('photoUrl')?.toString() || null;
}

let legacyRegistration: Promise<void> | undefined;

export function registerLegacyUploads(): Promise<void> {
	legacyRegistration ??= (async () => {
		const known = new Set((await db.select({ filename: uploadedFiles.filename }).from(uploadedFiles)).map((r) => r.filename));
		for (const category of ['leadership', 'meetings'] as const) {
			const dir = join(uploadsRoot, uploadDir(category));
			for (const filename of await readdir(dir).catch(() => [])) {
				if (known.has(filename)) continue;
				const { size, mtime } = await stat(join(dir, filename));
				const ext = filename.split('.').pop()?.toLowerCase();
				await db.insert(uploadedFiles).values({
					id: randomUUID(),
					filename,
					category,
					originalName: filename,
					mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
					sizeBytes: size,
					uploadedBy: 'legacy',
					createdAt: mtime
				});
			}
		}
	})().catch((error) => {
		legacyRegistration = undefined;
		throw error;
	});
	return legacyRegistration;
}

export async function listImages() {
	await registerLegacyUploads();
	const rows = await db.query.uploadedFiles.findMany({
		where: (f, { and, isNull, like }) => and(isNull(f.deletedAt), like(f.mimeType, 'image/%')),
		orderBy: (f, { desc }) => desc(f.createdAt)
	});
	return rows.map((f) => ({ url: uploadUrl(f), name: f.originalName, category: f.category }));
}
