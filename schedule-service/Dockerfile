FROM ghcr.io/astral-sh/uv:alpine
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev

# Copy application code
COPY . ./

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
