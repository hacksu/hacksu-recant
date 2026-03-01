# Course Schedule Admin Panel — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate a Kent State CS course schedule scraper as a FastAPI microservice and display the results in a new admin panel page.

**Architecture:** A `schedule-service/` Python microservice (FastAPI + UV) exposes `GET /scrape`, which scrapes the Kent State course schedule and enriches rows with lecturer emails. SvelteKit calls this from a form action (`/admin/schedule`) when the admin clicks "Refresh", then upserts a `course_schedule` Postgres table. The admin page reads from that table.

**Tech Stack:** Python 3.14, FastAPI, uvicorn, requests, beautifulsoup4, UV; SvelteKit, Drizzle ORM, PostgreSQL, Tailwind CSS

---

### Task 1: Create the `schedule-service` Python microservice

**Files:**
- Create: `schedule-service/.python-version`
- Create: `schedule-service/pyproject.toml`
- Create: `schedule-service/Dockerfile`
- Create: `schedule-service/.dockerignore`
- Create: `schedule-service/main.py`

**Step 1: Create `.python-version`**

```
3.14
```

**Step 2: Create `pyproject.toml`**

```toml
[project]
name = "schedule-service"
version = "0.1.0"
description = "Kent State CS course schedule scraper"
readme = "README.md"
requires-python = ">=3.14"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn>=0.32.0",
    "requests>=2.32.5",
    "beautifulsoup4>=4.12.3",
]
```

**Step 3: Create `Dockerfile`** — mirrors `lessons-service/Dockerfile` exactly, only CMD differs:

```dockerfile
FROM ghcr.io/astral-sh/uv:alpine
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev

# Copy application code
COPY . ./

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Step 4: Create `.dockerignore`**

```
__pycache__
*.pyc
.venv
```

**Step 5: Create `main.py`**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

app = FastAPI()

SCHEDULE_URL = "https://web.cs.kent.edu/schedule/index.php"
SEARCH_URL = "https://www.kent.edu/cs/faculty-staff?field_profile_type_target_id=All&title="
SKIPPED_EMAILS = {"office@cs.kent.edu", "info@kent.edu"}

COLUMN_MAP = [
    (0, "code"),
    (4, "name"),
    (5, "day"),
    (6, "time"),
    (7, "lecturer"),
    (8, "location"),
]


class Course(BaseModel):
    code: str
    name: str
    day: str | None = None
    time: str | None = None
    lecturer: str | None = None
    location: str | None = None
    email: str | None = None


def get_email(lecturer: str) -> str | None:
    try:
        last, first = lecturer.lower().strip().split(", ", 1)
        url = f"{SEARCH_URL}{first}"
        soup = BeautifulSoup(requests.get(url, timeout=10).content, "html.parser")
        for anchor in soup.select('a[href^="mailto:"]'):
            if anchor.string and anchor.string not in SKIPPED_EMAILS:
                return anchor.string
    except Exception:
        pass
    return None


def parse_row(tds) -> dict:
    course: dict = {}
    for idx, key in COLUMN_MAP:
        value = tds[idx].string.strip() if tds[idx].string else ""
        if value:
            course[key] = value
        elif key == "lecturer":
            course[key] = None
    return course


@app.get("/scrape", response_model=list[Course])
def scrape():
    try:
        soup = BeautifulSoup(
            requests.get(SCHEDULE_URL, timeout=15).content, "html.parser"
        )
        table = soup.find("table", id="scheduleTbl")
        if not table:
            raise HTTPException(status_code=502, detail="Schedule table not found")
        rows = table.find("tbody").find_all("tr")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch schedule: {e}")

    courses = []
    for row in rows:
        tds = row.find_all("td")
        course = parse_row(tds)
        if course.get("lecturer"):
            course["email"] = get_email(course["lecturer"])
        courses.append(Course(**course))

    return courses
```

**Step 6: Generate the uv.lock file**

Run from inside the `schedule-service/` directory:
```bash
cd schedule-service && uv lock
```

Expected: `uv.lock` file is created.

**Step 7: Commit**

```bash
git add schedule-service/
git commit -m "feat: add schedule-service FastAPI microservice"
```

---

### Task 2: Add `schedule-service` to Docker Compose

**Files:**
- Modify: `compose.yaml`

**Step 1: Add the service block**

In `compose.yaml`, after the `lessons-service` block and before the `app` block, add:

```yaml
  schedule-service:
    build:
      context: ./schedule-service
      dockerfile: Dockerfile
    restart: on-failure:5
    networks:
      - app-network
```

**Step 2: Add `schedule-service` as a dependency of `app`**

The `app` service's `depends_on` block currently has `db` and `redis`. Add `schedule-service`:

```yaml
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
      schedule-service:
        condition: service_started
```

**Step 3: Add `SCHEDULE_SERVICE_URL` to the `app` environment**

In the `app` service's `environment` block, add:

```yaml
      SCHEDULE_SERVICE_URL: http://schedule-service:8000
```

**Step 4: Commit**

```bash
git add compose.yaml
git commit -m "feat: add schedule-service to docker compose"
```

---

### Task 3: Add `SCHEDULE_SERVICE_URL` to the SvelteKit environment

**Files:**
- Modify: `.env.example` (add the key so future devs know it's needed)

**Step 1: Add to `.env.example`**

Open `.env.example` and append:

```
SCHEDULE_SERVICE_URL=http://localhost:8000
```

**Step 2: Add to your local `.env` as well**

```
SCHEDULE_SERVICE_URL=http://localhost:8000
```

**Step 3: Commit**

```bash
git add .env.example
git commit -m "feat: add SCHEDULE_SERVICE_URL env var"
```

---

### Task 4: Add `courseSchedule` table to the Drizzle schema

**Files:**
- Modify: `src/lib/server/db/schema.ts`

**Step 1: Add the table definition**

At the bottom of `src/lib/server/db/schema.ts`, append:

```typescript
// Course schedule table — populated by the schedule-service scraper
export const courseSchedule = pgTable('course_schedule', {
	id: text('id').primaryKey(),
	code: text('code').notNull(),
	name: text('name').notNull(),
	day: text('day'),
	time: text('time'),
	lecturer: text('lecturer'),
	location: text('location'),
	email: text('email'),
	scrapedAt: timestamp('scraped_at', { withTimezone: true }).notNull()
});
```

**Step 2: Generate and run the migration**

```bash
npm run db:generate
npm run db:migrate
```

Expected: a new migration file is created in `drizzle/` and applied to the DB.

**Step 3: Commit**

```bash
git add src/lib/server/db/schema.ts drizzle/
git commit -m "feat: add course_schedule table to schema"
```

---

### Task 5: Create the `/admin/schedule` SvelteKit page

**Files:**
- Create: `src/routes/admin/schedule/+page.server.ts`
- Create: `src/routes/admin/schedule/+page.svelte`

**Step 1: Create `+page.server.ts`**

```typescript
import { db } from '$lib/server/db';
import { courseSchedule } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { asc } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const courses = await db.query.courseSchedule.findMany({
		orderBy: [asc(courseSchedule.code)]
	});

	return { courses };
};

export const actions: Actions = {
	refresh: async (event) => {
		await requireAdmin(event);

		const serviceUrl = env.SCHEDULE_SERVICE_URL ?? 'http://localhost:8000';

		let scraped: Array<{
			code: string;
			name: string;
			day?: string;
			time?: string;
			lecturer?: string;
			location?: string;
			email?: string;
		}>;

		try {
			const response = await fetch(`${serviceUrl}/scrape`);
			if (!response.ok) {
				return fail(502, { error: `Schedule service returned ${response.status}` });
			}
			scraped = await response.json();
		} catch {
			return fail(502, { error: 'Could not reach the schedule service. Is it running?' });
		}

		const scrapedAt = new Date();

		await db.delete(courseSchedule);
		await db.insert(courseSchedule).values(
			scraped.map((c) => ({
				id: randomUUID(),
				code: c.code,
				name: c.name,
				day: c.day ?? null,
				time: c.time ?? null,
				lecturer: c.lecturer ?? null,
				location: c.location ?? null,
				email: c.email ?? null,
				scrapedAt
			}))
		);

		redirect(303, '/admin/schedule');
	}
};
```

**Step 2: Create `+page.svelte`**

```svelte
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const courses = $derived(data.courses);

	let search = $state('');
	let refreshing = $state(false);

	const filtered = $derived(
		search.trim() === ''
			? courses
			: courses.filter(
					(c) =>
						c.code.toLowerCase().includes(search.toLowerCase()) ||
						c.name.toLowerCase().includes(search.toLowerCase()) ||
						(c.lecturer ?? '').toLowerCase().includes(search.toLowerCase())
				)
	);

	const lastScraped = $derived(
		courses.length > 0
			? new Date(courses[0].scrapedAt).toLocaleString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			: null
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-3xl font-bold">Course Schedule</h1>
			{#if lastScraped}
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Last scraped: {lastScraped}</p>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No data yet — click Refresh to scrape.</p>
			{/if}
		</div>

		<form
			method="POST"
			action="?/refresh"
			use:enhance={() => {
				refreshing = true;
				return async ({ update }) => {
					await update();
					refreshing = false;
				};
			}}
		>
			<button
				type="submit"
				disabled={refreshing}
				class="bg-hacksu-green hover:bg-hacksu-green/90 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				{refreshing ? 'Refreshing…' : 'Refresh'}
			</button>
		</form>
	</div>

	{#if form?.error}
		<div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
			{form.error}
		</div>
	{/if}

	{#if courses.length > 0}
		<div class="mb-4">
			<input
				type="text"
				bind:value={search}
				placeholder="Search by code, name, or lecturer…"
				class="w-full max-w-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
						<tr>
							<th class="px-4 py-3 text-left">Code</th>
							<th class="px-4 py-3 text-left">Name</th>
							<th class="px-4 py-3 text-left">Day</th>
							<th class="px-4 py-3 text-left">Time</th>
							<th class="px-4 py-3 text-left">Lecturer</th>
							<th class="px-4 py-3 text-left">Email</th>
							<th class="px-4 py-3 text-left">Location</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each filtered as course (course.id)}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
								<td class="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap">{course.code}</td>
								<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{course.name}</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{course.day ?? '—'}</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{course.time ?? '—'}</td>
								<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{course.lecturer ?? '—'}</td>
								<td class="px-4 py-3">
									{#if course.email}
										<a
											href="mailto:{course.email}"
											class="text-hacksu-green hover:underline"
										>{course.email}</a>
									{:else}
										<span class="text-gray-400">—</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-400">{course.location ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
				{filtered.length} of {courses.length} courses
			</div>
		</div>
	{:else if !form?.error}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
			<p class="text-gray-600 dark:text-gray-400">No schedule data yet. Click <strong>Refresh</strong> to scrape the current schedule.</p>
		</div>
	{/if}
</div>
```

**Step 3: Commit**

```bash
git add src/routes/admin/schedule/
git commit -m "feat: add /admin/schedule page"
```

---

### Task 6: Add "Course Schedule" to the admin dashboard

**Files:**
- Modify: `src/routes/admin/+page.svelte`

**Step 1: Add an entry to `adminActions`**

In `src/routes/admin/+page.svelte`, find the `adminActions` array and add this entry:

```typescript
{
    title: 'Course Schedule',
    href: '/admin/schedule',
    description: 'View the current CS course schedule with lecturer emails'
},
```

Place it wherever makes sense in the list (e.g., after Lesson Icons).

**Step 2: Commit**

```bash
git add src/routes/admin/+page.svelte
git commit -m "feat: add course schedule link to admin dashboard"
```

---

### Task 7: Verify end-to-end

**Step 1: Start the dev environment**

```bash
npm run db:start   # starts Postgres + Redis via Docker Compose
npm run dev        # starts SvelteKit dev server
```

**Step 2: Start the schedule service locally for dev**

```bash
cd schedule-service
uv run uvicorn main:app --port 8000 --reload
```

**Step 3: Log in and navigate to `/admin/schedule`**

- Visit `http://localhost:5173/admin/schedule`
- Confirm the page loads with an empty state and a "Refresh" button

**Step 4: Click "Refresh"**

- The action should call `http://localhost:8000/scrape`
- Expect a delay (one HTTP call per lecturer)
- After redirect, courses should appear in the table

**Step 5: Verify search works**

- Type a lecturer name or course code in the search box
- Confirm the table filters correctly

**Step 6: Verify error handling**

- Stop the schedule service (`Ctrl+C` in the uvicorn terminal)
- Click "Refresh" again
- Confirm the red error banner appears: "Could not reach the schedule service…"

**Step 7: Commit if any fixups were needed, then done**

```bash
git add -p
git commit -m "fix: <whatever was wrong>"
```
