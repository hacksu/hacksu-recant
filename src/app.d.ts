// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Locals {
			isAdmin?: boolean;
			auditBeforeState?: Record<string, any> | null;
			auditFormData?: Record<string, any> | null;
			auditMapping?: {
				resourceType: string;
				resourceId: string | null;
				action: string;
			} | null;
		}
	}
}

export {};
