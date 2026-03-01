import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

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
async def scrape():
    log.info("scrape: fetching schedule")
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: requests.get(SCHEDULE_URL, timeout=15))
        soup = BeautifulSoup(response.content, "html.parser")
        table = soup.find("table", id="scheduleTbl")
        if not table:
            raise HTTPException(status_code=502, detail="Schedule table not found")
        rows = table.find("tbody").find_all("tr")
    except HTTPException:
        raise
    except Exception as e:
        log.exception("scrape: failed to fetch schedule")
        raise HTTPException(status_code=502, detail=f"Failed to fetch schedule: {e}")

    raw = [parse_row(row.find_all("td")) for row in rows]

    merged: dict[str, dict] = {}
    for course in raw:
        code = course.get("code")
        if not code:
            continue
        if code not in merged:
            merged[code] = dict(course)
        else:
            for field in ("name", "day", "time", "lecturer", "location"):
                if not merged[code].get(field) and course.get(field):
                    merged[code][field] = course[field]

    courses = [c for c in merged.values() if c.get("lecturer")]
    log.info("scrape: parsed %d rows, %d merged with lecturers", len(raw), len(courses))

    unique_lecturers = {c["lecturer"] for c in courses if c.get("lecturer")}
    log.info("scrape: fetching emails for %d unique lecturers", len(unique_lecturers))

    with ThreadPoolExecutor(max_workers=10) as executor:
        email_results = await asyncio.gather(
            *[loop.run_in_executor(executor, get_email, lecturer) for lecturer in unique_lecturers]
        )
    email_map = dict(zip(unique_lecturers, email_results))

    log.info("scrape: done, returning %d courses", len(courses))
    return [Course(**{**c, "email": email_map.get(c["lecturer"]) if c.get("lecturer") else None}) for c in courses]
