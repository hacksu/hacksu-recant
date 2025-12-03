// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User, Session } from 'lucia';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	} // interface Error {}
	// interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export {};
