# syntax=docker/dockerfile:1
FROM ghcr.io/astral-sh/uv:alpine
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --no-dev --locked

# Copy application code
COPY . ./

# Run the service
CMD ["uv", "run", "main.py"]

